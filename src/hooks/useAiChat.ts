import { useState, useCallback, useRef, useEffect } from 'react';
import { Content } from '@google/generative-ai';
import { geminiService } from '../services/ai/gemini.service';
import { aiChatService } from '../services/firebase/ai-chat.service';
import { getCurrentUser } from '../services/firebase/auth.service';
import { trekService, TrekDocument } from '../services/firebase/trek.service';

export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  componentType?: 'recommendation';
  componentData?: any;
};

export const useAiChat = (initialSessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  
  // Refs for async closures to always have the latest state without dependency cycles
  const messagesRef = useRef<ChatMessage[]>([]);
  const historyRef = useRef<Content[]>([]);
  const sessionIdRef = useRef<string | null>(initialSessionId || null);
  const treksRef = useRef<TrekDocument[]>([]);

  // Preload treks from DB
  useEffect(() => {
    const loadTreks = async () => {
      const dbTreks = await trekService.getAllTreks();
      treksRef.current = dbTreks;
    };
    loadTreks();
  }, []);

  // Load initial session if provided or latest session
  useEffect(() => {
    const loadSession = async () => {
      let idToLoad = initialSessionId;

      if (!idToLoad) {
        // Try to fetch the latest session for the current user
        const user = getCurrentUser();
        if (user) {
          try {
            const sessions = await aiChatService.getUserChatSessions(user.uid);
            if (sessions && sessions.length > 0) {
              idToLoad = sessions[0].id;
            }
          } catch (err) {
            console.error('Failed to fetch user chat sessions:', err);
          }
        }
      }

      if (idToLoad) {
        try {
          const data = await aiChatService.getChatSession(idToLoad);
          if (data) {
            messagesRef.current = data.messages;
            setMessages(data.messages);
            setSessionId(idToLoad);
            sessionIdRef.current = idToLoad;
            
            // Rebuild Gemini history format
            historyRef.current = data.messages
              .filter(msg => (msg.role === 'user' || msg.role === 'model') && msg.text)
              .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
              }));
          }
        } catch (err) {
          console.error('Failed to load chat session:', err);
          setError('Failed to load previous chat history.');
        }
      }
    };
    loadSession();
  }, [initialSessionId]);

  const syncToFirebase = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      if (!sessionIdRef.current) {
        // Create new session
        const newId = await aiChatService.createChatSession(user.uid, messagesRef.current);
        sessionIdRef.current = newId;
        setSessionId(newId);
      } else {
        // Update existing session
        await aiChatService.updateChatSession(sessionIdRef.current, messagesRef.current);
      }
    } catch (err) {
      console.error('Failed to sync chat to Firebase:', err);
      // We don't necessarily want to interrupt the UX if Firebase fails to sync, 
      // but logging it is important.
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    
    // 2. Prepare bot message placeholder
    const botMessageId = Math.random().toString(36).substring(7);
    const botMessage: ChatMessage = {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    messagesRef.current = [...messagesRef.current, userMessage, botMessage];
    setMessages([...messagesRef.current]);
    setIsTyping(true);
    setError(null);

    try {
      // 3. Start streaming
      const stream = geminiService.streamChat(historyRef.current, text);
      let accumulatedText = '';

      for await (const chunk of stream) {
        setIsTyping(false);
        accumulatedText += chunk;
        
        // Update the specific bot message
        messagesRef.current = messagesRef.current.map(msg => 
          msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
        );
        setMessages([...messagesRef.current]);
      }

      // 4. Finalize the message
      messagesRef.current = messagesRef.current.map(msg => 
        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
      );
      setMessages([...messagesRef.current]);

      // Detect treks mentioned in the text
      const lowerText = accumulatedText.toLowerCase();
      const detectedTreks = treksRef.current.filter(trek => {
        return trek.keywords?.some((kw: string) => lowerText.includes(kw));
      });

      // Append detected treks as separate messages
      for (const rec of detectedTreks) {
        const msg: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          role: 'model',
          text: '',
          timestamp: new Date(),
          componentType: 'recommendation',
          componentData: rec,
        };
        messagesRef.current = [...messagesRef.current, msg];
      }
      
      if (detectedTreks.length > 0) {
        setMessages([...messagesRef.current]);
      }

      // Update Gemini history ref
      historyRef.current.push({ role: 'user', parts: [{ text }] });
      historyRef.current.push({ role: 'model', parts: [{ text: accumulatedText }] });

      // 5. Sync to Firebase
      await syncToFirebase();

    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'An error occurred while generating the response.');
      setIsTyping(false);
      
      // Update the failed message
      messagesRef.current = messagesRef.current.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
          : msg
      );
      setMessages([...messagesRef.current]);
      
      // Attempt to sync the error message to Firebase so the user knows what happened in history too
      await syncToFirebase();
    }
  }, []);

  const appendCustomMessage = useCallback(async (componentType: 'recommendation', data: any) => {
    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'model',
      text: '',
      timestamp: new Date(),
      componentType,
      componentData: data,
    };
    messagesRef.current = [...messagesRef.current, msg];
    setMessages([...messagesRef.current]);
    
    await syncToFirebase();
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    historyRef.current = [];
    setSessionId(null);
    sessionIdRef.current = null;
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    sessionId,
    sendMessage,
    appendCustomMessage,
    clearChat,
  };
};

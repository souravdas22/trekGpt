import { COLLECTIONS } from './collections';
import { 
  addDocument, 
  updateDocument, 
  getDocument,
  getCollection
} from './firestore.service';
import { FirebaseFirestoreTypes, getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { ChatMessage } from '../../hooks/useAiChat';

export interface AiChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  updatedAt: FirebaseFirestoreTypes.Timestamp | Date;
  messages: any[]; // Using any to handle the conversion between Date and Timestamp
}

class AiChatService {
  private static instance: AiChatService;

  private constructor() {}

  public static getInstance(): AiChatService {
    if (!AiChatService.instance) {
      AiChatService.instance = new AiChatService();
    }
    return AiChatService.instance;
  }

  /**
   * Helper to serialize messages before saving to Firestore
   * Ensures Dates are converted safely (though Firestore SDK handles JS Dates, 
   * doing it explicitly is safer)
   */
  private serializeMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(),
    }));
  }

  /**
   * Helper to deserialize messages from Firestore
   */
  private deserializeMessages(rawMessages: any[]): ChatMessage[] {
    if (!rawMessages) return [];
    
    return rawMessages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp),
    }));
  }

  /**
   * Creates a new chat session in Firestore
   */
  public async createChatSession(userId: string, initialMessages: ChatMessage[]): Promise<string> {
    const newSession: Omit<AiChatSession, 'id'> = {
      userId,
      title: 'New TrekGPT Chat', // Auto-naming could be added here later
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: this.serializeMessages(initialMessages),
    };

    return await addDocument(COLLECTIONS.AI_CHATS, newSession);
  }

  /**
   * Appends messages to an existing chat session
   */
  public async updateChatSession(chatSessionId: string, messages: ChatMessage[]): Promise<void> {
    const updateData = {
      messages: this.serializeMessages(messages),
      updatedAt: new Date(),
    };

    await updateDocument(COLLECTIONS.AI_CHATS, chatSessionId, updateData);
  }

  /**
   * Retrieves a specific chat session by ID
   */
  public async getChatSession(chatSessionId: string): Promise<{ session: AiChatSession, messages: ChatMessage[] } | null> {
    const session = await getDocument<AiChatSession>(COLLECTIONS.AI_CHATS, chatSessionId);
    if (!session) return null;

    return {
      session: { ...session, id: chatSessionId },
      messages: this.deserializeMessages(session.messages),
    };
  }

  /**
   * Retrieves all chat sessions for a specific user (for history screen)
   */
  public async getUserChatSessions(userId: string): Promise<AiChatSession[]> {
    try {
      const collectionRef = collection(getFirestore(), COLLECTIONS.AI_CHATS);
      const q = query(
        collectionRef, 
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      const sessions = snapshot.docs.map(doc => {
        const data = doc.data() as AiChatSession;
        return {
          ...data,
          id: doc.id,
        };
      });

      // Sort by updatedAt descending in memory to avoid needing a Firestore composite index
      return sessions.sort((a, b) => {
        const timeA = a.updatedAt instanceof Date 
          ? a.updatedAt.getTime() 
          : (a.updatedAt as any)?.toDate ? (a.updatedAt as any).toDate().getTime() : 0;
        const timeB = b.updatedAt instanceof Date 
          ? b.updatedAt.getTime() 
          : (b.updatedAt as any)?.toDate ? (b.updatedAt as any).toDate().getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.log('Error getting user chat sessions:', error);
      throw error;
    }
  }
}

export const aiChatService = AiChatService.getInstance();

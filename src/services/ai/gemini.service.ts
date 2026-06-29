import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold, Content } from '@google/generative-ai';
import env from '@config/env';
import {
  AIResponse,
  FitnessPlan,
  ItineraryDay,
  PackingCategory,
  TrekPlannerParams,
  TrekPlannerResponse,
  TrekRecommendation,
  DetailedItineraryResponse,
  DetailedPackingListResponse,
} from './types';
import { contextBuilderService } from './context-builder.service';
import { getCurrentUser } from '../firebase/auth.service';

// Constants
const TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

class GeminiService {
  private static instance: GeminiService;
  private ai: GoogleGenerativeAI;
  private defaultModel: GenerativeModel;

  private constructor() {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing from environment variables.');
      // Initialize with empty string to prevent immediate crash, 
      // but API calls will fail appropriately when used.
      this.ai = new GoogleGenerativeAI(''); 
    } else {
      this.ai = new GoogleGenerativeAI(apiKey);
    }

    // Configure the default model to use
    this.defaultModel = this.ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Helper to execute a prompt with timeout, retries, and error handling
   */
  private async executePrompt<T>(
    prompt: string,
    isJsonOutput: boolean = true,
    retries: number = MAX_RETRIES
  ): Promise<AIResponse<T>> {
    try {
      if (!env.GEMINI_API_KEY) {
        throw new Error('API key is not configured.');
      }

      const user = getCurrentUser();
      let fullPrompt = prompt;
      if (user) {
        const userContext = await contextBuilderService.buildUserContext(user.uid);
        if (userContext) {
          fullPrompt = `[USER HISTORY AND PREFERENCES]\n${userContext}\n[END USER CONTEXT]\n\nPlease consider the user's history and preferences above when answering the following prompt:\n${prompt}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      // We might need to override generation config if it's not JSON
      const model = isJsonOutput 
        ? this.defaultModel 
        : this.ai.getGenerativeModel({ model: 'gemini-flash-latest' });

      // @google/generative-ai SDK doesn't natively support AbortSignal in generateContent yet in some versions,
      // but we wrap the promise in a timeout race anyway.
      const generatePromise = model.generateContent(fullPrompt);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS);
      });

      const result = await Promise.race([generatePromise, timeoutPromise]) as any;
      clearTimeout(timeoutId);

      const responseText = result.response.text();
      
      if (!responseText) {
        throw new Error('Received empty response from AI.');
      }

      if (isJsonOutput) {
        try {
          // Attempt to parse JSON. Sometimes AI wraps JSON in markdown blocks like ```json ... ```
          let cleanText = responseText.trim();
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.substring(7);
          }
          if (cleanText.startsWith('```')) {
            cleanText = cleanText.substring(3);
          }
          if (cleanText.endsWith('```')) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
          }
          
          const parsedData = JSON.parse(cleanText) as T;
          return { data: parsedData, error: null, isSuccess: true };
        } catch {
          throw new Error('Failed to parse AI response into JSON format.');
        }
      }

      return { data: responseText as unknown as T, error: null, isSuccess: true };
    } catch (error: any) {
      // Handle Rate Limiting (429) and retry
      if (error.status === 429 && retries > 0) {
        console.warn(`Rate limited by Gemini AI. Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), RETRY_DELAY_MS));
        return this.executePrompt<T>(prompt, isJsonOutput, retries - 1);
      }
      
      // Generic error handling
      let errorMessage = 'An unexpected error occurred while contacting AI.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return { data: null, error: errorMessage, isSuccess: false };
    }
  }

  // --- Reusable AI Methods ---

  public async planTrek(params: TrekPlannerParams): Promise<AIResponse<TrekPlannerResponse>> {
    const prompt = `You are an expert trekking planner. Based on the following criteria, plan the best trek:
    - Budget: ${params.budget}
    - Starting City: ${params.startingCity}
    - Days Available: ${params.daysAvailable}
    - Trek Experience: ${params.trekExperience}
    - Preferred Month: ${params.preferredMonth}
    
    Return ONLY a valid JSON object representing the trek plan. Use this exact schema:
    {
      "recommendedTrek": "string (Name of the recommended trek)",
      "estimatedBudget": "string (Estimated cost)",
      "difficulty": "string (e.g., Easy, Moderate, Hard, Expert)",
      "bestTime": "string (Best time to do this trek)",
      "fitnessRequirement": "string (Fitness level required)",
      "shortExplanation": "string (A short explanation of why this trek was chosen)"
    }`;

    return this.executePrompt<TrekPlannerResponse>(prompt);
  }

  public async generateDetailedItinerary(trekName: string, days: number, startingCity: string): Promise<AIResponse<DetailedItineraryResponse>> {
    const prompt = `You are an expert trekking guide. Generate a comprehensive, realistic day-by-day itinerary for a ${days}-day trek to ${trekName}, starting from ${startingCity}.
    
    The itinerary must include two levels of tips:
    1. Global Tips (applies to the entire trek)
    2. Day-specific Tips (applies to each specific day)

    Return ONLY a valid JSON object representing the detailed itinerary. Use this exact schema:
    {
      "trekName": "string",
      "duration": number,
      "bestSeason": "string",
      "totalEstimatedCost": "string",
      "difficulty": "string",
      "fitnessRequirement": "string",
      "emergencyNumbers": ["string"],
      "globalTips": ["string"],
      "days": [
        {
          "dayNumber": number,
          "title": "string",
          "date": "string (e.g., Day 1)",
          "summary": "string",
          "activities": ["string"],
          "travel": "string",
          "accommodation": "string",
          "meals": ["string"],
          "estimatedCost": "string",
          "weatherRecommendation": "string",
          "packingItems": ["string"],
          "checkpoints": ["string"],
          "emergencyContacts": ["string"],
          "importantTips": ["string (Day-specific tips)"]
        }
      ]
    }`;

    return this.executePrompt<DetailedItineraryResponse>(prompt);
  }

  public async generateDetailedPackingList(trekName: string, month: string, weather: string, duration: number, difficulty: string): Promise<AIResponse<DetailedPackingListResponse>> {
    const prompt = `You are an expert trekking guide. Generate a comprehensive packing list for a ${duration}-day trek to ${trekName} during ${month}.
    The weather is expected to be: ${weather}. The difficulty is ${difficulty}.
    
    The packing list MUST include exactly these categories: Clothing, Equipment, Medical, Electronics, Food, Emergency.
    For each item, generate a unique "id" (a random short string), and set "isCompleted" to false.
    
    Return ONLY a valid JSON object representing the detailed packing list. Use this exact schema:
    {
      "trekName": "string",
      "month": "string",
      "categories": [
        {
          "categoryName": "string",
          "items": [
            {
              "id": "string (unique random string)",
              "name": "string",
              "quantity": number,
              "priority": "High" | "Medium" | "Low",
              "reason": "string",
              "isCompleted": false
            }
          ]
        }
      ]
    }`;

    return this.executePrompt<DetailedPackingListResponse>(prompt);
  }

  public async generateTrekRecommendation(preferences: string): Promise<AIResponse<TrekRecommendation>> {
    const prompt = `You are an expert trekking guide. Based on the following user preferences, recommend a single trek: "${preferences}".
    
    Return ONLY a valid JSON object representing the recommendation. Use this exact schema:
    {
      "name": "string (Name of the trek)",
      "location": "string (Region, Country)",
      "difficulty": "Easy" | "Moderate" | "Hard" | "Expert",
      "durationDays": number,
      "bestSeason": "string (e.g., Spring, Autumn)",
      "description": "string (A compelling 2-3 sentence description)",
      "estimatedCost": "string (e.g., $500 - $800)"
    }`;

    return this.executePrompt<TrekRecommendation>(prompt);
  }

  public async generatePackingList(trekName: string, durationDays: number, season: string): Promise<AIResponse<PackingCategory[]>> {
    const prompt = `You are an expert trekking guide. Generate a comprehensive, categorized packing list for a ${durationDays}-day trek to ${trekName} during the ${season} season.
    
    Return ONLY a valid JSON array of category objects. Use this exact schema:
    [
      {
        "category": "string (e.g., Clothing, Gear, First Aid)",
        "items": [
          {
            "name": "string (Item name)",
            "quantity": number,
            "necessity": "Essential" | "Recommended" | "Optional",
            "notes": "string (Optional, brief context on why it's needed)"
          }
        ]
      }
    ]`;

    return this.executePrompt<PackingCategory[]>(prompt);
  }

  public async generateItinerary(trekName: string, durationDays: number): Promise<AIResponse<ItineraryDay[]>> {
    const prompt = `You are an expert trekking guide. Generate a realistic day-by-day itinerary for a ${durationDays}-day trek to ${trekName}.
    
    Return ONLY a valid JSON array of daily itinerary objects. Use this exact schema:
    [
      {
        "day": number,
        "title": "string (e.g., Arrival in Kathmandu, Trek to Namche)",
        "distanceKm": number,
        "elevationGainMeters": number,
        "accommodation": "string (e.g., Tea House, Tent, Hotel)",
        "description": "string (Brief description of the day's journey)"
      }
    ]`;

    return this.executePrompt<ItineraryDay[]>(prompt);
  }

  public async generateFitnessPlan(trekDifficulty: string, userFitnessLevel: string, durationWeeks: number): Promise<AIResponse<FitnessPlan>> {
    const prompt = `You are an expert trekking fitness coach. Generate a ${durationWeeks}-week fitness training plan for a user currently at a "${userFitnessLevel}" fitness level, preparing for a trek with "${trekDifficulty}" difficulty.
    
    Return ONLY a valid JSON object representing the fitness plan. Use this exact schema:
    {
      "durationWeeks": number,
      "weeklyRoutine": [
        {
          "dayOfWeek": "string (e.g., Monday, Tuesday)",
          "activity": "string (e.g., Running, Strength, Rest)",
          "durationMinutes": number,
          "intensity": "Low" | "Medium" | "High",
          "description": "string (Specific instructions for the activity)"
        }
      ],
      "generalAdvice": "string (Overall advice for the training period)"
    }`;

    return this.executePrompt<FitnessPlan>(prompt);
  }

  public async answerUserQuestion(question: string, context?: string): Promise<AIResponse<string>> {
    const prompt = `You are an expert trekking and mountaineering assistant. Answer the user's question accurately, concisely, and professionally.
    
    ${context ? `Context: ${context}` : ''}
    
    User Question: ${question}
    
    Answer:`;

    // Note: Not requesting JSON output for general conversational answers
    return this.executePrompt<string>(prompt, false);
  }

  public async *streamChat(
    history: Content[],
    message: string,
    context?: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      if (!env.GEMINI_API_KEY) {
        throw new Error('API key is not configured.');
      }

      const user = getCurrentUser();
      let systemContext = context || 'You are an expert trekking and mountaineering assistant. Answer accurately, concisely, and professionally. Format text clearly with markdown.';
      
      if (user) {
        const userContext = await contextBuilderService.buildUserContext(user.uid);
        
        if (userContext) {
          systemContext += `\n\n[USER HISTORY AND PREFERENCES]\n${userContext}\n[END USER CONTEXT]\n\nPlease consider the user's history and preferences when answering.`;
        }
      }

      // Configure a conversational model
      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemContext,
      });

      const chatSession = model.startChat({
        history: history,
      });
      
      // We use the non-streaming method because React Native's fetch does not 
      // support ReadableStream.pipeThrough natively, which crashes the SDK.
      const result = await chatSession.sendMessage(message);
      const fullText = result.response.text();

      // Simulate a streaming effect for the UI by yielding words
      const words = fullText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        yield chunk;
        // 30ms delay per word for a natural typing effect
        await new Promise(resolve => setTimeout(() => resolve(undefined), 30)); 
      }
    } catch (error: any) {
      console.error('Error in streamChat:', error);
      throw error;
    }
  }
}

export const geminiService = GeminiService.getInstance();

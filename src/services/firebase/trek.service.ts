import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from './collections';

export interface TrekDocument {
  id: string;
  name: string;
  location: string;
  durationDays: number;
  difficulty: string;
  estimatedCost: string;
  keywords: string[];
  imageUrl?: string;
  createdAt?: any;
}

class TrekService {
  private static instance: TrekService;
  private cachedTreks: TrekDocument[] | null = null;

  private constructor() {}

  public static getInstance(): TrekService {
    if (!TrekService.instance) {
      TrekService.instance = new TrekService();
    }
    return TrekService.instance;
  }

  public async getAllTreks(forceRefresh = false): Promise<TrekDocument[]> {
    if (this.cachedTreks && !forceRefresh) {
      return this.cachedTreks;
    }

    try {
      const snapshot = await firestore().collection(COLLECTIONS.TREKS).get();
      const treks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as TrekDocument;
      });
      
      this.cachedTreks = treks;
      return treks;
    } catch (error) {
      console.error('Error fetching treks:', error);
      return [];
    }
  }

  public async getTrekById(id: string): Promise<TrekDocument | null> {
    try {
      const doc = await firestore().collection(COLLECTIONS.TREKS).doc(id).get();
      if (doc.data()) {
        return { id: doc.id, ...doc.data() } as TrekDocument;
      }
      return null;
    } catch (error) {
      console.error('Error fetching trek:', error);
      return null;
    }
  }
}

export const trekService = TrekService.getInstance();

import { getFirestore, collection, getDocs, doc, getDoc } from '@react-native-firebase/firestore';
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
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, COLLECTIONS.TREKS));
      const treks = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
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
      const db = getFirestore();
      const docRef = doc(db, COLLECTIONS.TREKS, id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as TrekDocument;
      }
      return null;
    } catch (error) {
      console.error('Error fetching trek:', error);
      return null;
    }
  }
}

export const trekService = TrekService.getInstance();

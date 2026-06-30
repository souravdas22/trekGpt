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
  category?: string;
  imageUrl?: string;
  imageUrls?: string[];
  photoCount?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  createdAt?: any;
  distanceKm?: number;
  maxAltitudeFt?: number;
  description?: string;
  tags?: string[];
  highlights?: { icon: string; text: string }[];
  bestTime?: { months: string; season: string; icon: string; isActive: boolean }[];
  inclusions?: string[];
  essentials?: { icon: string; title: string; subtitle: string }[];
  itinerary?: { dayNumber: number; title: string; distanceStr: string; timeStr: string; imageUrl?: string }[];
  provider?: { name: string; rating: number; reviewCount: number; logoUrl?: string };
}

export interface CategoryDocument {
  id: string;
  name: string;
  icon?: string;
  order?: number;
}

export interface ThemeDocument {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  imageUrl: string;
  isActive: boolean;
}

export interface ReviewDocument {
  id?: string;
  authorName: string;
  rating: number;
  date: string | any;
  text: string;
  imageUrls?: string[];
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

  public async getCategories(): Promise<CategoryDocument[]> {
    try {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
      return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CategoryDocument));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  public async getThemes(): Promise<ThemeDocument[]> {
    try {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, COLLECTIONS.THEMES));
      return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ThemeDocument));
    } catch (error) {
      console.error('Error fetching themes:', error);
      return [];
    }
  }

  public async getTrekReviews(trekId: string): Promise<ReviewDocument[]> {
    try {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, COLLECTIONS.TREKS, trekId, 'reviews'));
      return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ReviewDocument));
    } catch (error) {
      console.error('Error fetching trek reviews:', error);
      return [];
    }
  }
}

export const trekService = TrekService.getInstance();

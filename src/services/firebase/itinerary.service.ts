import { addDocument } from './firestore.service';
import { DetailedItineraryResponse } from '../ai/types';
import { firebaseAuth } from './firebase';

const ITINERARIES_COLLECTION = 'itineraries';

export class ItineraryService {
  private static instance: ItineraryService;

  private constructor() {}

  public static getInstance(): ItineraryService {
    if (!ItineraryService.instance) {
      ItineraryService.instance = new ItineraryService();
    }
    return ItineraryService.instance;
  }

  /**
   * Save a newly generated detailed itinerary to Firestore
   */
  public async saveItinerary(itinerary: DetailedItineraryResponse): Promise<string> {
    const user = firebaseAuth().currentUser;
    const dataToSave = {
      ...itinerary,
      userId: user ? user.uid : null,
      createdAt: new Date().toISOString(),
    };

    return addDocument(ITINERARIES_COLLECTION, dataToSave);
  }
}

export const itineraryService = ItineraryService.getInstance();

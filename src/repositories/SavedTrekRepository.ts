import { BaseRepository } from './BaseRepository';
import { SavedTrek } from './types';
import { COLLECTIONS } from '../services/firebase/collections';

class SavedTrekRepository extends BaseRepository<SavedTrek> {
  private static instance: SavedTrekRepository;

  private constructor() {
    super(COLLECTIONS.SAVED_TREKS);
  }

  public static getInstance(): SavedTrekRepository {
    if (!SavedTrekRepository.instance) {
      SavedTrekRepository.instance = new SavedTrekRepository();
    }
    return SavedTrekRepository.instance;
  }

  /**
   * Retrieves all saved treks for a given user.
   */
  public async getUserSavedTreks(userId: string): Promise<SavedTrek[]> {
    return this.getByField('userId', userId);
  }

  /**
   * Check if a specific trek is saved by the user.
   */
  public async isTrekSaved(userId: string, trekName: string): Promise<boolean> {
    const existing = await this.getByFields({ userId, trekName });
    return existing.length > 0;
  }

  /**
   * Save a trek for a user. Prevents duplicates.
   */
  public async saveTrek(userId: string, trekName: string): Promise<string | null> {
    const alreadySaved = await this.isTrekSaved(userId, trekName);
    if (alreadySaved) {
      return null;
    }

    return this.add({
      userId,
      trekName,
      savedAt: Date.now(),
    });
  }

  /**
   * Remove a saved trek for a user by trekName.
   */
  public async removeTrek(userId: string, trekName: string): Promise<void> {
    const existing = await this.getByFields({ userId, trekName });
    
    // Delete all matches just in case duplicates sneaked in
    for (const trek of existing) {
      if (trek.id) {
        await this.delete(trek.id);
      }
    }
  }
}

export const savedTrekRepository = SavedTrekRepository.getInstance();

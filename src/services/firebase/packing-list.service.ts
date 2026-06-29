import { addDocument, getDocument, updateDocument } from './firestore.service';
import { DetailedPackingListResponse } from '../ai/types';
import { firebaseAuth } from './firebase';

const PACKING_LISTS_COLLECTION = 'packing_lists';

export class PackingListService {
  private static instance: PackingListService;

  private constructor() {}

  public static getInstance(): PackingListService {
    if (!PackingListService.instance) {
      PackingListService.instance = new PackingListService();
    }
    return PackingListService.instance;
  }

  /**
   * Save a newly generated packing list to Firestore
   */
  public async savePackingList(list: DetailedPackingListResponse): Promise<string> {
    const user = firebaseAuth().currentUser;
    const dataToSave = {
      ...list,
      userId: user ? user.uid : null,
      createdAt: new Date().toISOString(),
    };

    return addDocument(PACKING_LISTS_COLLECTION, dataToSave);
  }

  /**
   * Toggle the completion status of a specific item in a packing list.
   * Fetches the document, updates the item locally, and saves the document.
   */
  public async toggleItemCompletion(listId: string, categoryName: string, itemId: string, isCompleted: boolean): Promise<void> {
    // 1. Fetch the entire document
    const list = await getDocument<DetailedPackingListResponse>(PACKING_LISTS_COLLECTION, listId);
    if (!list) {
      throw new Error(`Packing list with ID ${listId} not found.`);
    }

    // 2. Find the category and item
    let itemFound = false;
    const updatedCategories = list.categories.map((category) => {
      if (category.categoryName === categoryName) {
        return {
          ...category,
          items: category.items.map((item) => {
            if (item.id === itemId) {
              itemFound = true;
              return { ...item, isCompleted };
            }
            return item;
          })
        };
      }
      return category;
    });

    if (!itemFound) {
      throw new Error(`Item with ID ${itemId} in category ${categoryName} not found.`);
    }

    // 3. Update the document in Firestore
    await updateDocument(PACKING_LISTS_COLLECTION, listId, { categories: updatedCategories });
  }
}

export const packingListService = PackingListService.getInstance();

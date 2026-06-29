import { createDocument, getDocument } from './firestore.service';
import { COLLECTIONS } from './collections';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  createdAt: number;
}

export const saveUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const existingProfile = await getUserProfile(uid);
    if (!existingProfile) {
      await createDocument(COLLECTIONS.USERS, uid, {
        ...data,
        id: uid,
        createdAt: Date.now(),
      });
    }
  } catch (error) {
    console.log('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    return await getDocument<UserProfile>(COLLECTIONS.USERS, uid);
  } catch (error) {
    console.log('Error getting user profile:', error);
    throw error;
  }
};

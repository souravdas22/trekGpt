import { BaseRepository } from './BaseRepository';
import { CommunityPost } from './types';
import { COLLECTIONS } from '../services/firebase/collections';
import {
  getFirestore,
  collection as firestoreCollection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export class CommunityPostRepository extends BaseRepository<CommunityPost> {
  constructor() {
    super(COLLECTIONS.COMMUNITY_POSTS);
  }

  public async getPaginatedPosts(
    pageSize: number = 20,
    lastVisibleDoc?: FirebaseFirestoreTypes.DocumentData | null
  ): Promise<{ posts: CommunityPost[]; lastVisible: FirebaseFirestoreTypes.DocumentData | null }> {
    try {
      const collectionRef = firestoreCollection(getFirestore(), this.collectionName);
      
      let q = query(collectionRef, orderBy('createdAt', 'desc'), limit(pageSize));
      
      if (lastVisibleDoc) {
        q = query(collectionRef, orderBy('createdAt', 'desc'), startAfter(lastVisibleDoc), limit(pageSize));
      }

      const querySnapshot = await getDocs(q);
      
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as CommunityPost[];

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { posts, lastVisible };
    } catch (error) {
      console.error('Error fetching paginated community posts:', error);
      throw error;
    }
  }
}

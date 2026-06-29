import { BaseRepository } from './BaseRepository';
import { PostComment } from './types';
import { COLLECTIONS } from '../services/firebase/collections';
import {
  getFirestore,
  collection as firestoreCollection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export class CommunityCommentRepository extends BaseRepository<PostComment> {
  constructor() {
    super(COLLECTIONS.COMMENTS);
  }

  public async getPaginatedComments(
    postId: string,
    pageSize: number = 20,
    lastVisibleDoc?: FirebaseFirestoreTypes.DocumentData | null
  ): Promise<{ comments: PostComment[]; lastVisible: FirebaseFirestoreTypes.DocumentData | null }> {
    try {
      const collectionRef = firestoreCollection(getFirestore(), this.collectionName);
      
      let q = query(
        collectionRef,
        where('postId', '==', postId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      if (lastVisibleDoc) {
        q = query(
          collectionRef,
          where('postId', '==', postId),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisibleDoc),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as PostComment[];

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { comments, lastVisible };
    } catch (error) {
      console.error(`Error fetching paginated comments for post ${postId}:`, error);
      throw error;
    }
  }
}

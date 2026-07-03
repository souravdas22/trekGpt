import { CommunityPostRepository } from '../../repositories/CommunityPostRepository';
import { CommunityLikeRepository } from '../../repositories/CommunityLikeRepository';
import { CommunityCommentRepository } from '../../repositories/CommunityCommentRepository';
import { CommunityPost, PostLike, PostComment, StoryDocument, JourneyDocument, CircleDocument, EventDocument } from '../../repositories/types';
import { uploadCommunityImage, deleteImage } from './storage.service';
import { 
  FirebaseFirestoreTypes, 
  getFirestore, 
  doc, 
  runTransaction,
  collection as firestoreCollection,
  getDocs,
  query,
  where,
  writeBatch
} from '@react-native-firebase/firestore';
import { COLLECTIONS } from './collections';

class CommunityService {
  private postRepo = new CommunityPostRepository();
  private likeRepo = new CommunityLikeRepository();
  private commentRepo = new CommunityCommentRepository();

  public async createPost(userId: string, content: string, localImagePath?: string): Promise<string> {
    const newPost: CommunityPost = {
      userId,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likesCount: 0,
      commentsCount: 0,
    };

    const postId = await this.postRepo.add(newPost);

    if (localImagePath) {
      const imageUrl = await uploadCommunityImage(postId, localImagePath);
      
      // Extract path from download URL to store it for deletion later
      let imageStoragePath: string | undefined = undefined;
      const parts = imageUrl.split('?')[0].split('/o/');
      if (parts.length > 1) {
        imageStoragePath = decodeURIComponent(parts[1]);
      }

      await this.postRepo.update(postId, { imageUrl, imageStoragePath });
    }

    return postId;
  }

  public async getPosts(pageSize: number = 20, lastVisibleDoc?: FirebaseFirestoreTypes.DocumentData | null) {
    return await this.postRepo.getPaginatedPosts(pageSize, lastVisibleDoc);
  }

  public async deletePost(postId: string): Promise<void> {
    const post = await this.postRepo.get(postId);
    if (!post) return;

    if (post.imageStoragePath) {
      try {
        await deleteImage(post.imageStoragePath);
      } catch (e) {
        console.error('Failed to delete image for post', e);
      }
    }

    const firestore = getFirestore();
    
    // Attempt batch deletion for likes and comments to maintain cleaner DB, 
    // though in large scale a Cloud Function is better.
    try {
      const likesQuery = query(firestoreCollection(firestore, COLLECTIONS.LIKES), where('postId', '==', postId));
      const commentsQuery = query(firestoreCollection(firestore, COLLECTIONS.COMMENTS), where('postId', '==', postId));
      
      const [likesSnap, commentsSnap] = await Promise.all([
        getDocs(likesQuery),
        getDocs(commentsQuery)
      ]);

      // A single batch can handle up to 500 writes
      const batch = writeBatch(firestore);
      
      likesSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
      commentsSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
      
      await batch.commit();
    } catch (e) {
      console.error('Failed to delete sub-collections for post', e);
    }

    // Finally delete the post document
    await this.postRepo.delete(postId);
  }

  public async likePost(userId: string, postId: string): Promise<void> {
    const firestore = getFirestore();
    const postRef = doc(firestore, COLLECTIONS.COMMUNITY_POSTS, postId);
    
    // Check if already liked to prevent double counting
    const existingLikes = await this.likeRepo.getByField('postId', postId);
    const alreadyLiked = existingLikes.find(l => l.userId === userId);
    if (alreadyLiked) return;

    await runTransaction(firestore, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) throw new Error('Post does not exist');
      
      const newLikesCount = (postDoc.data()?.likesCount || 0) + 1;
      transaction.update(postRef, { likesCount: newLikesCount });

      const newLikeRef = doc(firestoreCollection(firestore, COLLECTIONS.LIKES));
      transaction.set(newLikeRef, {
        postId,
        userId,
        createdAt: Date.now()
      } as PostLike);
    });
  }

  public async unlikePost(userId: string, postId: string): Promise<void> {
    const firestore = getFirestore();
    const postRef = doc(firestore, COLLECTIONS.COMMUNITY_POSTS, postId);

    const existingLikes = await this.likeRepo.getByField('postId', postId);
    const likeToRemove = existingLikes.find(l => l.userId === userId);
    
    if (!likeToRemove || !likeToRemove.id) return;

    const likeRef = doc(firestore, COLLECTIONS.LIKES, likeToRemove.id);

    await runTransaction(firestore, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) throw new Error('Post does not exist');
      
      const newLikesCount = Math.max((postDoc.data()?.likesCount || 0) - 1, 0);
      transaction.update(postRef, { likesCount: newLikesCount });
      transaction.delete(likeRef);
    });
  }

  public async addComment(userId: string, postId: string, content: string): Promise<void> {
    const firestore = getFirestore();
    const postRef = doc(firestore, COLLECTIONS.COMMUNITY_POSTS, postId);

    await runTransaction(firestore, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) throw new Error('Post does not exist');
      
      const newCommentsCount = (postDoc.data()?.commentsCount || 0) + 1;
      transaction.update(postRef, { commentsCount: newCommentsCount });

      const newCommentRef = doc(firestoreCollection(firestore, COLLECTIONS.COMMENTS));
      transaction.set(newCommentRef, {
        postId,
        userId,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as PostComment);
    });
  }

  public async getComments(postId: string, pageSize: number = 20, lastVisibleDoc?: FirebaseFirestoreTypes.DocumentData | null) {
    return await this.commentRepo.getPaginatedComments(postId, pageSize, lastVisibleDoc);
  }

  // --- Methods for other community sections ---

  public async getStories(): Promise<StoryDocument[]> {
    const firestore = getFirestore();
    const snap = await getDocs(firestoreCollection(firestore, COLLECTIONS.STORIES));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryDocument));
  }

  public async getJourneys(): Promise<{ trending: JourneyDocument[], featured: JourneyDocument[], list: JourneyDocument[] }> {
    const firestore = getFirestore();
    const snap = await getDocs(firestoreCollection(firestore, COLLECTIONS.JOURNEYS));
    const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JourneyDocument));
    return {
      trending: all.filter(j => j.group === 'trending'),
      featured: all.filter(j => j.group === 'featured'),
      list: all.filter(j => j.group === 'list'),
    };
  }

  public async getCircles(): Promise<{ popular: CircleDocument[], my: CircleDocument[], discover: CircleDocument[] }> {
    const firestore = getFirestore();
    const snap = await getDocs(firestoreCollection(firestore, COLLECTIONS.CIRCLES));
    const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CircleDocument));
    return {
      popular: all.filter(c => c.group === 'popular'),
      my: all.filter(c => c.group === 'my'),
      discover: all.filter(c => c.group === 'discover'),
    };
  }

  public async getEvents(): Promise<EventDocument[]> {
    const firestore = getFirestore();
    const snap = await getDocs(firestoreCollection(firestore, COLLECTIONS.EVENTS));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventDocument));
  }
}

export const communityService = new CommunityService();

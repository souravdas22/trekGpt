export interface UserPlan {
  id?: string;
  userId: string;
  trekName: string;
  startDate: string;
  endDate: string;
  itineraryRef: string; // ID of the generated itinerary in the 'itineraries' collection
  status: 'planning' | 'ongoing' | 'completed';
  createdAt: number;
}

export interface SavedTrek {
  id?: string;
  userId: string;
  trekName: string;
  savedAt: number;
}

export interface CommunityPost {
  id?: string;
  userId: string;
  content: string;
  imageUrl?: string;
  imageStoragePath?: string;
  createdAt: number;
  updatedAt: number;
  likesCount: number;
  commentsCount: number;
}

export interface PostLike {
  id?: string;
  postId: string;
  userId: string;
  createdAt: number;
}

export interface PostComment {
  id?: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

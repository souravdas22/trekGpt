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

export interface StoryDocument {
  id?: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  createdAt?: any;
}

export interface JourneyDocument {
  id?: string;
  group: 'trending' | 'featured' | 'list';
  title: string;
  author: string;
  authorAvatar: string;
  isVerified: boolean;
  image: string;
  imageCount: number;
  location: string;
  duration: string;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  likes: number;
  comments: number;
  views: number;
  badgeType: 'editor' | 'trending' | 'none';
  badgeText: string;
  tags: { type: string; text: string }[];
  createdAt?: any;
}

export interface CircleDocument {
  id?: string;
  group: 'popular' | 'my' | 'discover';
  name: string;
  type: string;
  image: string;
  description: string;
  members: number;
  extraMembers: number;
  joined: boolean;
  createdAt?: any;
}

export interface EventDocument {
  id?: string;
  title: string;
  type: string;
  image: string;
  month: string;
  day: string;
  weekday: string;
  location: string;
  attendees: number;
  extraAttendees: number;
  going: boolean;
  createdAt?: any;
}

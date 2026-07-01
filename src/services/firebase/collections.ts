export const COLLECTIONS = {
  USERS: 'users',
  USER_PLANS: 'user_plans',
  SAVED_TREKS: 'saved_treks',
  COMMUNITY_POSTS: 'community_posts',
  LIKES: 'likes',
  COMMENTS: 'comments',
  ACHIEVEMENTS: 'achievements',
  AI_CHATS: 'ai_chats',
  TREKS: 'treks',
  CATEGORIES: 'categories',
  THEMES: 'themes',
  STORIES: 'stories',
  JOURNEYS: 'journeys',
  CIRCLES: 'circles',
  EVENTS: 'events',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

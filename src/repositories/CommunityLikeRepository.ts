import { BaseRepository } from './BaseRepository';
import { PostLike } from './types';
import { COLLECTIONS } from '../services/firebase/collections';

export class CommunityLikeRepository extends BaseRepository<PostLike> {
  constructor() {
    super(COLLECTIONS.LIKES);
  }
}

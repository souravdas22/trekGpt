import { BaseRepository } from './BaseRepository';
import { UserPlan } from './types';
import { COLLECTIONS } from '../services/firebase/collections';

class UserPlanRepository extends BaseRepository<UserPlan> {
  private static instance: UserPlanRepository;

  private constructor() {
    super(COLLECTIONS.USER_PLANS);
  }

  public static getInstance(): UserPlanRepository {
    if (!UserPlanRepository.instance) {
      UserPlanRepository.instance = new UserPlanRepository();
    }
    return UserPlanRepository.instance;
  }

  /**
   * Retrieves all plans for a given user.
   */
  public async getUserPlans(userId: string): Promise<UserPlan[]> {
    return this.getByField('userId', userId);
  }
}

export const userPlanRepository = UserPlanRepository.getInstance();

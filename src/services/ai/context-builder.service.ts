import { getUserProfile } from '../firebase/user.service';
import { savedTrekRepository } from '../../repositories/SavedTrekRepository';
import { userPlanRepository } from '../../repositories/UserPlanRepository';

export class ContextBuilderService {
  private static instance: ContextBuilderService;

  private constructor() {}

  public static getInstance(): ContextBuilderService {
    if (!ContextBuilderService.instance) {
      ContextBuilderService.instance = new ContextBuilderService();
    }
    return ContextBuilderService.instance;
  }

  public async buildUserContext(userId: string): Promise<string> {
    try {
      const profile = await getUserProfile(userId);
      const savedTreks = await savedTrekRepository.getUserSavedTreks(userId);
      const activePlans = await userPlanRepository.getUserPlans(userId);

      let contextParts: string[] = [];

      if (profile) {
        contextParts.push(`User Profile:\nName: ${profile.name || 'Unknown'}\nEmail: ${profile.email}`);
        
        // Include preferences if they exist in the profile
        if ((profile as any).preferences) {
          contextParts.push(`Preferences:\n${JSON.stringify((profile as any).preferences, null, 2)}`);
        }
      }

      if (savedTreks && savedTreks.length > 0) {
        const treksList = savedTreks.map(t => t.trekName).join(', ');
        contextParts.push(`Saved Treks: ${treksList}`);
      }

      if (activePlans && activePlans.length > 0) {
        const plansList = activePlans.map(p => `${p.trekName} (${p.status})`).join(', ');
        contextParts.push(`Active and Past Plans: ${plansList}`);
      }

      if (contextParts.length === 0) {
        return '';
      }

      return contextParts.join('\n\n');
    } catch (error) {
      console.log('Error building user context:', error);
      return '';
    }
  }
}

export const contextBuilderService = ContextBuilderService.getInstance();

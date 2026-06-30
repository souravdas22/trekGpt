export interface TrekRecommendation {
  id?: string;
  name: string;
  location: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert' | string;
  durationDays: number;
  bestSeason: string;
  description: string;
  estimatedCost: string;
  imageUrl?: string;
}

export interface TrekPlannerParams {
  budget: string;
  startingCity: string;
  daysAvailable: number;
  trekExperience: string;
  preferredMonth: string;
}

export interface TrekPlannerResponse {
  recommendedTrek: string;
  estimatedBudget: string;
  difficulty: string;
  bestTime: string;
  fitnessRequirement: string;
  shortExplanation: string;
}

export interface PackingItem {
  name: string;
  quantity: number;
  necessity: 'Essential' | 'Recommended' | 'Optional';
  notes?: string;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface DetailedPackingItem {
  id: string;
  name: string;
  quantity: number;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  isCompleted: boolean;
}

export interface DetailedPackingCategory {
  categoryName: string; // 'Clothing' | 'Equipment' | 'Medical' | 'Electronics' | 'Food' | 'Emergency'
  items: DetailedPackingItem[];
}

export interface DetailedPackingListResponse {
  trekName: string;
  month: string;
  categories: DetailedPackingCategory[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  distanceKm: number;
  elevationGainMeters: number;
  accommodation: string;
  description: string;
}

export interface DetailedItineraryDay {
  dayNumber: number;
  title: string;
  date: string;
  summary: string;
  activities: string[];
  travel: string;
  accommodation: string;
  meals: string[];
  estimatedCost: string;
  weatherRecommendation: string;
  packingItems: string[];
  checkpoints: string[];
  emergencyContacts: string[];
  importantTips: string[];
}

export interface DetailedItineraryResponse {
  trekName: string;
  duration: number;
  bestSeason: string;
  totalEstimatedCost: string;
  difficulty: string;
  fitnessRequirement: string;
  emergencyNumbers: string[];
  globalTips: string[];
  days: DetailedItineraryDay[];
}

export interface FitnessRoutine {
  dayOfWeek: string;
  activity: string;
  durationMinutes: number;
  intensity: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface FitnessPlan {
  durationWeeks: number;
  weeklyRoutine: FitnessRoutine[];
  generalAdvice: string;
}

export interface AIResponse<T> {
  data: T | null;
  error: string | null;
  isSuccess: boolean;
}

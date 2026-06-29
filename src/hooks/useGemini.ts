import { useState, useCallback } from 'react';
import { geminiService } from '../services/ai/gemini.service';
import { itineraryService } from '../services/firebase/itinerary.service';
import { packingListService } from '../services/firebase/packing-list.service';
import {
  TrekRecommendation,
  TrekPlannerParams,
  TrekPlannerResponse,
  DetailedItineraryResponse,
  DetailedPackingListResponse,
  PackingCategory,
  ItineraryDay,
  FitnessPlan,
} from '../services/ai/types';

export const useGemini = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAiCall = async <T>(
    apiCall: () => Promise<{ data: T | null; error: string | null; isSuccess: boolean }>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (!response.isSuccess || !response.data) {
        setError(response.error || 'An unknown error occurred');
        return null;
      }
      return response.data;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const planTrek = useCallback(
    async (params: TrekPlannerParams) => {
      if (
        !params.budget ||
        !params.startingCity ||
        !params.daysAvailable ||
        !params.trekExperience ||
        !params.preferredMonth
      ) {
        setError('All planner fields are required.');
        return null;
      }
      
      if (params.daysAvailable <= 0) {
        setError('Days available must be greater than 0.');
        return null;
      }

      return handleAiCall<TrekPlannerResponse>(() =>
        geminiService.planTrek(params)
      );
    },
    []
  );

  const generateAndSaveItinerary = useCallback(
    async (trekName: string, days: number, startingCity: string) => {
      if (!trekName || days <= 0 || !startingCity) {
        setError('Trek name, starting city, and positive number of days are required.');
        return null;
      }
      
      const response = await handleAiCall<DetailedItineraryResponse>(() =>
        geminiService.generateDetailedItinerary(trekName, days, startingCity)
      );

      if (response) {
        try {
          // Attempt to save to Firestore if AI generated it successfully
          await itineraryService.saveItinerary(response);
        } catch (err: any) {
          setError('Failed to save itinerary to Firestore: ' + (err.message || 'Unknown error'));
        }
      }
      
      return response;
    },
    []
  );

  const generateAndSavePackingList = useCallback(
    async (trekName: string, month: string, weather: string, duration: number, difficulty: string) => {
      if (!trekName || !month || !weather || duration <= 0 || !difficulty) {
        setError('All packing list parameters are required and duration must be positive.');
        return null;
      }
      
      const response = await handleAiCall<DetailedPackingListResponse>(() =>
        geminiService.generateDetailedPackingList(trekName, month, weather, duration, difficulty)
      );

      if (response) {
        try {
          await packingListService.savePackingList(response);
        } catch (err: any) {
          setError('Failed to save packing list to Firestore: ' + (err.message || 'Unknown error'));
        }
      }
      
      return response;
    },
    []
  );

  const getTrekRecommendation = useCallback(
    async (preferences: string) => {
      return handleAiCall<TrekRecommendation>(() =>
        geminiService.generateTrekRecommendation(preferences)
      );
    },
    []
  );

  const getPackingList = useCallback(
    async (trekName: string, durationDays: number, season: string) => {
      return handleAiCall<PackingCategory[]>(() =>
        geminiService.generatePackingList(trekName, durationDays, season)
      );
    },
    []
  );

  const getItinerary = useCallback(
    async (trekName: string, durationDays: number) => {
      return handleAiCall<ItineraryDay[]>(() =>
        geminiService.generateItinerary(trekName, durationDays)
      );
    },
    []
  );

  const getFitnessPlan = useCallback(
    async (trekDifficulty: string, userFitnessLevel: string, durationWeeks: number) => {
      return handleAiCall<FitnessPlan>(() =>
        geminiService.generateFitnessPlan(trekDifficulty, userFitnessLevel, durationWeeks)
      );
    },
    []
  );

  const askQuestion = useCallback(
    async (question: string, context?: string) => {
      return handleAiCall<string>(() =>
        geminiService.answerUserQuestion(question, context)
      );
    },
    []
  );

  return {
    isLoading,
    error,
    planTrek,
    generateAndSaveItinerary,
    generateAndSavePackingList,
    getTrekRecommendation,
    getPackingList,
    getItinerary,
    getFitnessPlan,
    askQuestion,
  };
};

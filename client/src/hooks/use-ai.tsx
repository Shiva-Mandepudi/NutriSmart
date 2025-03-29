import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DietaryPreferences, MealPlanContent } from "@shared/schema";
import { useToast } from "./use-toast";

interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  analysis: string;
  healthRating: number;
  recommendations: string;
}

export function useAI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate a meal plan based on user preferences
  const generateMealPlanMutation = useMutation({
    mutationFn: async (preferences: DietaryPreferences & { calorieTarget?: number }) => {
      const response = await apiRequest("POST", "/api/ai/meal-plan", preferences);
      return response.json() as Promise<MealPlanContent>;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Analyze food description for nutritional content
  const analyzeFoodMutation = useMutation({
    mutationFn: async (foodDescription: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-food", { foodDescription });
      return response.json() as Promise<FoodAnalysis>;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze food",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ask a nutrition question to the AI chatbot
  const askNutritionQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { question });
      const data = await response.json();
      return data.answer as string;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to get an answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    generateMealPlanMutation,
    analyzeFoodMutation,
    askNutritionQuestionMutation
  };
}
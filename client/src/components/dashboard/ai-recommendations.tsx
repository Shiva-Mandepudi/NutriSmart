import { BrainCircuit, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Meal } from "@shared/schema";

export function AIRecommendations() {
  const { user } = useAuth();
  
  // Properly type our query responses
  const { data: meals = [], isLoading: isMealsLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
  });
  
  const { data: subscription = { plan: "free" }, isLoading: isSubscriptionLoading } = useQuery<{
    plan: string;
    id?: number;
    userId?: number;
    startDate?: string;
    endDate?: string | null;
    isActive?: boolean;
  }>({
    queryKey: ['/api/subscription'],
  });
  
  if (isMealsLoading || isSubscriptionLoading) {
    return <AIRecommendationsSkeleton />;
  }
  
  const isUserPremium = subscription?.plan === "premium";
  
  // Calculate recommendations based on user data
  // This is simplified, in a real app we would use more sophisticated analysis
  const getRecommendation = () => {
    if (!meals || meals.length === 0) {
      return "Start logging your meals to get personalized AI recommendations!";
    }
    
    // Look at last 7 days of meals
    const lastWeekMeals = meals.filter((meal: Meal) => {
      const mealDate = new Date(meal.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return mealDate >= sevenDaysAgo;
    });
    
    // Calculate average protein
    const avgProtein = lastWeekMeals.reduce((sum: number, meal: Meal) => sum + (meal.protein || 0), 0) / Math.max(1, lastWeekMeals.length);
    const recommendedProtein = (user?.weightKg || 70) * 1.6; // 1.6g per kg of bodyweight
    
    if (avgProtein < recommendedProtein * 0.85) {
      const deficit = Math.round((recommendedProtein - avgProtein) / recommendedProtein * 100);
      return `You're ${deficit}% under your protein goal this week. Try adding more lean protein sources like tofu, chicken breast, or legumes to reach your fitness goals.`;
    }
    
    // Other recommendation logic would go here
    return "Your nutrition looks balanced! Keep up the good work.";
  };
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white relative overflow-hidden card-shadow">
        <div className="absolute top-0 right-0 opacity-10">
          <BrainCircuit className="h-36 w-36" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">AI-Powered Recommendations</h3>
        <p className="mb-4 max-w-xl">
          Based on your dietary preferences and goals, our AI has created personalized meal plans tailored just for you.
        </p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 max-w-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <BrainCircuit className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">{getRecommendation()}</h4>
              <p className="text-sm text-white/80">
                {isUserPremium ? 
                  "Unlock even more insights with your Premium subscription." : 
                  "Upgrade to Premium for more detailed nutrition analysis and personalized recommendations."}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link href="/meal-plans" className="py-2 px-4 bg-white text-primary-600 rounded-full font-medium shadow-lg hover:shadow-xl transition">
            View Meal Plans
          </Link>
          {!isUserPremium && (
            <Link href="/subscription" className="py-2 px-4 bg-white/20 hover:bg-white/30 rounded-full font-medium transition">
              Upgrade for more insights
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function AIRecommendationsSkeleton() {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white relative overflow-hidden">
        <Skeleton className="h-8 w-64 bg-white/30 mb-2" />
        <Skeleton className="h-4 w-full max-w-xl bg-white/30 mb-1" />
        <Skeleton className="h-4 w-3/4 max-w-xl bg-white/30 mb-4" />
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 max-w-xl">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full bg-white/30 flex-shrink-0" />
            <div className="w-full">
              <Skeleton className="h-5 w-full bg-white/30 mb-2" />
              <Skeleton className="h-5 w-3/4 bg-white/30 mb-2" />
              <Skeleton className="h-4 w-full bg-white/30" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32 bg-white/30 rounded-full" />
          <Skeleton className="h-10 w-48 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

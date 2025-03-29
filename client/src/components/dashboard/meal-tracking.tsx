import { Card, CardContent } from "@/components/ui/card";
import { Flame, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Meal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function MealTrackingCard() {
  const { data: meals, isLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
  });
  
  // Calculate streak (number of consecutive days with logged meals)
  const streak = calculateStreak(meals || []);
  
  // Generate weekday labels
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Today's index in the week (0 = Monday, 6 = Sunday)
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0-indexed week starting from Monday
  
  if (isLoading) {
    return <MealTrackingCardSkeleton />;
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Meal Tracking</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{streak}-day streak</span>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <div className="text-center">
                <Flame className="h-6 w-6 text-amber-500 mx-auto" />
                <span className="block font-bold">{streak}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day, index) => (
            <div key={index} className="text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">{day}</span>
              <div className={`w-8 h-8 mx-auto mt-1 rounded-full flex items-center justify-center
                ${index === todayIndex 
                  ? "bg-amber-100 dark:bg-amber-900/30" 
                  : index < todayIndex 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-gray-100 dark:bg-gray-700"}`}>
                {index === todayIndex ? (
                  <span className="text-xs text-amber-600 dark:text-amber-400">Today</span>
                ) : index < todayIndex ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate streak
function calculateStreak(meals: Meal[]): number {
  if (meals.length === 0) return 0;
  
  // Sort meals by date
  const sortedMeals = [...meals].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get array of unique dates
  const uniqueDates = [...new Set(sortedMeals.map(meal => 
    new Date(meal.date).toISOString().split('T')[0]
  ))];
  
  // Calculate streak
  let streak = 1;
  const today = new Date().toISOString().split('T')[0];
  
  // If no meals today, don't count today in streak
  if (uniqueDates[0] !== today) {
    return 0;
  }
  
  // Count consecutive days
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i - 1]);
    const prevDate = new Date(uniqueDates[i]);
    
    // Check if dates are consecutive
    currentDate.setDate(currentDate.getDate() - 1);
    if (currentDate.toISOString().split('T')[0] === uniqueDates[i]) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function MealTrackingCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        <div className="flex items-center justify-center my-4">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-4 w-4 mx-auto mb-1" />
              <Skeleton className="h-8 w-8 mx-auto rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

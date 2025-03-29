import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Meal, WaterIntake } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import Chart from "chart.js/auto";

export function DailySummary() {
  const { user } = useAuth();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }));
  
  const queryClient = useQueryClient();
  
  const { data: meals, isLoading: isMealsLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
  });

  // Filter today's meals
  const todayMeals = meals?.filter(meal => {
    const mealDate = new Date(meal.date);
    const today = new Date();
    return mealDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  }) || [];

  // Calculate total macros
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = todayMeals.reduce((sum, meal) => sum + meal.fats, 0);
  
  // Set up donut chart
  useEffect(() => {
    if (chartRef.current && !isMealsLoading) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const calorieGoal = user?.calorieGoal || 2000;
      const caloriesLeft = Math.max(0, calorieGoal - totalCalories);
      
      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [totalCalories, caloriesLeft],
              backgroundColor: [
                '#6366f1', // Primary color
                '#e5e7eb', // Light gray
              ],
              borderWidth: 0,
              cutout: '80%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [totalCalories, isMealsLoading, user]);
  
  if (isMealsLoading) {
    return <DailySummarySkeleton />;
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Today's Summary</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{currentDate}</span>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <div className="w-36 h-36 relative">
            <canvas ref={chartRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{totalCalories.toLocaleString()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {user?.calorieGoal || 2000} cal
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <span className="block text-sm font-medium">Protein</span>
              <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">
                {totalProtein}g
              </span>
            </div>
          </div>
          <div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <span className="block text-sm font-medium">Carbs</span>
              <span className="block text-lg font-bold text-green-600 dark:text-green-400">
                {totalCarbs}g
              </span>
            </div>
          </div>
          <div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
              <span className="block text-sm font-medium">Fats</span>
              <span className="block text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {totalFats}g
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DailySummarySkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        <div className="flex items-center justify-center my-4">
          <Skeleton className="w-36 h-36 rounded-full" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Chart from "chart.js/auto";
import { useQuery } from "@tanstack/react-query";
import { Meal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function WeeklyProgress() {
  const [timeRange, setTimeRange] = useState("week");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { user } = useAuth();
  
  const { data: meals, isLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
  });
  
  useEffect(() => {
    if (chartRef.current && !isLoading && meals) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      // Prepare chart data based on selected time range
      const { labels, caloriesData } = prepareChartData(meals, timeRange, user?.calorieGoal || 2000);
      
      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Calories',
              data: caloriesData.actual,
              backgroundColor: '#6366f1',
              borderRadius: 8,
              barThickness: 12
            },
            {
              label: 'Goal',
              data: caloriesData.goal,
              backgroundColor: '#e5e7eb',
              borderRadius: 8,
              barThickness: 12
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              max: Math.max(...caloriesData.goal, ...caloriesData.actual) * 1.2,
              ticks: { stepSize: 500 }
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [meals, isLoading, timeRange, user?.calorieGoal]);
  
  if (isLoading) {
    return <WeeklyProgressSkeleton />;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Progress Tracking</h3>
        <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
          <ToggleGroupItem value="day" className="text-sm">Day</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-sm">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="text-sm">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <Card className="bg-white dark:bg-gray-800 rounded-xl">
        <CardContent className="p-5">
          <canvas ref={chartRef} height="200"></canvas>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to prepare chart data
function prepareChartData(meals: Meal[], timeRange: string, calorieGoal: number) {
  let labels: string[] = [];
  let actualData: number[] = [];
  let goalData: number[] = [];
  
  const now = new Date();
  
  switch (timeRange) {
    case 'day':
      // Last 24 hours broken down by meal time
      labels = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
      const todayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0);
      });
      
      actualData = labels.map(mealType => {
        const meal = todayMeals.find(m => m.mealType.toLowerCase() === mealType.toLowerCase());
        return meal ? meal.calories : 0;
      });
      
      // Distribute calorie goal across meal types (example distribution)
      goalData = [calorieGoal * 0.25, calorieGoal * 0.35, calorieGoal * 0.1, calorieGoal * 0.3];
      break;
      
    case 'week':
      // Last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayNumbers = [];
      labels = [];
      
      // Get day indices from today backwards for 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayNumbers.push(d.getDay());
        labels.push(days[d.getDay() === 0 ? 6 : d.getDay() - 1]);
      }
      
      actualData = dayNumbers.map((dayNum, index) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - (6 - index));
        
        const dayMeals = meals.filter(meal => {
          const mealDate = new Date(meal.date);
          return mealDate.setHours(0, 0, 0, 0) === targetDate.setHours(0, 0, 0, 0);
        });
        
        return dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      });
      
      goalData = Array(7).fill(calorieGoal);
      break;
      
    case 'month':
      // Last 4 weeks
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
      actualData = labels.map((_, index) => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (index * 7));
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        
        const weekMeals = meals.filter(meal => {
          const mealDate = new Date(meal.date);
          return mealDate >= startDate && mealDate <= endDate;
        });
        
        const totalCalories = weekMeals.reduce((sum, meal) => sum + meal.calories, 0);
        // Average per day
        return Math.round(totalCalories / 7);
      });
      
      goalData = Array(4).fill(calorieGoal);
      break;
  }
  
  return {
    labels,
    caloriesData: {
      actual: actualData,
      goal: goalData
    }
  };
}

function WeeklyProgressSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      
      <Card className="bg-white dark:bg-gray-800 rounded-xl">
        <CardContent className="p-5">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

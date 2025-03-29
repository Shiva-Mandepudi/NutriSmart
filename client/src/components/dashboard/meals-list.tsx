import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, Utensils, Cookie } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Meal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AddMealForm } from "@/components/forms/add-meal-form";

export function MealsList() {
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false);
  
  const { data: meals, isLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
  });
  
  // Filter today's meals
  const todayMeals = meals?.filter(meal => {
    const mealDate = new Date(meal.date);
    const today = new Date();
    return mealDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  }) || [];
  
  // Group meals by type
  const mealsByType: Record<string, Meal> = {};
  
  todayMeals.forEach(meal => {
    mealsByType[meal.mealType] = meal;
  });
  
  const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
  
  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return <Coffee className="text-xl text-blue-600 dark:text-blue-400" />;
      case "lunch":
        return <Utensils className="text-xl text-green-600 dark:text-green-400" />;
      case "snack":
        return <Cookie className="text-xl text-yellow-600 dark:text-yellow-400" />;
      case "dinner":
        return <Utensils className="text-xl text-purple-600 dark:text-purple-400" />;
      default:
        return <Utensils />;
    }
  };
  
  const getMealBgColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "lunch":
        return "bg-green-100 dark:bg-green-900/30";
      case "snack":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "dinner":
        return "bg-purple-100 dark:bg-purple-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };
  
  if (isLoading) {
    return <MealsListSkeleton />;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Today's Meals</h3>
        <Button 
          onClick={() => setIsAddMealDialogOpen(true)}
          className="py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center gap-2 transition shadow-md shadow-primary-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Meal</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mealTypes.map(type => {
          const meal = mealsByType[type];
          const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
          
          return (
            <Card key={type} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h4 className="font-medium">{formattedType}</h4>
                {meal ? (
                  <span className="text-xs font-medium text-primary-500">{meal.calories} kcal</span>
                ) : (
                  <span className="text-xs font-medium text-gray-400">Not logged yet</span>
                )}
              </div>
              
              {meal ? (
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${getMealBgColor(type)} rounded-full flex items-center justify-center`}>
                      {getMealIcon(type)}
                    </div>
                    <div>
                      <h5 className="font-medium">{meal.name}</h5>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                      <span className="block text-gray-500 dark:text-gray-400">Protein</span>
                      <span className="font-semibold">{meal.protein}g</span>
                    </div>
                    <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                      <span className="block text-gray-500 dark:text-gray-400">Carbs</span>
                      <span className="font-semibold">{meal.carbs}g</span>
                    </div>
                    <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                      <span className="block text-gray-500 dark:text-gray-400">Fats</span>
                      <span className="font-semibold">{meal.fats}g</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center justify-center h-32">
                  <Button 
                    variant="ghost"
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2"
                    onClick={() => setIsAddMealDialogOpen(true)}
                  >
                    <Plus className="text-xl text-gray-500 dark:text-gray-400" />
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Add {formattedType.toLowerCase()}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Add Meal</DialogTitle>
          <AddMealForm onSuccess={() => setIsAddMealDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MealsListSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-4">
              <Skeleton className="h-20 w-full mb-3" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-12 rounded" />
                <Skeleton className="h-12 rounded" />
                <Skeleton className="h-12 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

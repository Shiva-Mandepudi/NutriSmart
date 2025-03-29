import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MealPlanCard } from "@/components/meal-plans/meal-plan-card";
import { MealPlansFilters } from "@/components/meal-plans/meal-plans-filters";
import { SubscriptionPrompt } from "@/components/meal-plans/subscription-prompt";
import { useQuery } from "@tanstack/react-query";
import { MealPlan } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function MealPlansPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Fetch meal plans
  const { data: mealPlans, isLoading: isMealPlansLoading } = useQuery<MealPlan[]>({
    queryKey: ['/api/meal-plans'],
  });
  
  // Fetch subscription status
  const { data: subscription, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['/api/subscription'],
  });
  
  const isUserPremium = subscription?.plan === "premium";
  
  // Extract unique diet types from meal plans
  const dietTypes = mealPlans 
    ? [...new Set(mealPlans.map(plan => plan.dietType))] 
    : [];
  
  // Filter meal plans based on active filter
  const filteredMealPlans = mealPlans
    ? activeFilter === "all"
      ? mealPlans
      : mealPlans.filter(plan => plan.dietType === activeFilter)
    : [];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">AI-Generated Meal Plans</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized nutrition plans based on your preferences and goals
            </p>
          </div>
          
          {/* Subscription Prompt - show only if user is not premium */}
          {!isSubscriptionLoading && !isUserPremium && <SubscriptionPrompt />}
          
          {/* Meal Plan Filters */}
          {!isMealPlansLoading ? (
            <div className="mb-6">
              <MealPlansFilters 
                dietTypes={dietTypes} 
                onFilterChange={setActiveFilter}
                activeFilter={activeFilter}
              />
            </div>
          ) : (
            <div className="mb-6">
              <Skeleton className="h-10 w-full max-w-md rounded-full" />
            </div>
          )}
          
          {/* Meal Plans Grid */}
          {isMealPlansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMealPlans.map((mealPlan) => (
                <MealPlanCard 
                  key={mealPlan.id} 
                  mealPlan={mealPlan} 
                  isPremium={isUserPremium}
                />
              ))}
              
              {filteredMealPlans.length === 0 && (
                <div className="col-span-full flex flex-col items-center py-12">
                  <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                    No meal plans found for this category
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Try selecting a different category
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      
      <MobileNav />
    </div>
  );
}

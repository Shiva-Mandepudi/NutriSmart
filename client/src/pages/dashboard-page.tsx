import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DailySummary } from "@/components/dashboard/daily-summary";
import { WaterIntakeCard } from "@/components/dashboard/water-intake";
import { MealTrackingCard } from "@/components/dashboard/meal-tracking";
import { MealsList } from "@/components/dashboard/meals-list";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { WeeklyProgress } from "@/components/dashboard/weekly-progress";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DietPreferencesForm } from "@/components/forms/diet-preferences-form";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  
  // Check if user has set dietary preferences
  const hasPreferences = !!user?.dietaryPreferences?.type;
  
  // Open preferences dialog on first login if not set
  useEffect(() => {
    if (user && !hasPreferences) {
      setShowPreferencesDialog(true);
    }
  }, [user, hasPreferences]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Your Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.firstName || user?.username}!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DailySummary />
            <WaterIntakeCard />
            <MealTrackingCard />
          </div>
          
          <MealsList />
          
          <AIRecommendations />
          
          <WeeklyProgress />
        </section>
      </main>
      
      <MobileNav />
      
      {/* Diet Preferences Dialog */}
      <Dialog open={showPreferencesDialog} onOpenChange={setShowPreferencesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Set Your Dietary Preferences</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            To provide you with personalized meal recommendations, we need to know a bit about your dietary preferences.
          </p>
          <DietPreferencesForm onSuccess={() => setShowPreferencesDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

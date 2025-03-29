import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MealPlan } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MealPlanCardProps {
  mealPlan: MealPlan;
  isPremium: boolean;
}

export function MealPlanCard({ mealPlan, isPremium }: MealPlanCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const unlockPremiumMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscribe", {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      toast({
        title: "Subscription successful!",
        description: "You now have access to all premium meal plans.",
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewPlan = () => {
    if (mealPlan.isPremium && !isPremium) {
      setIsDialogOpen(true);
    } else {
      // View the meal plan content
      toast({
        title: `Viewing ${mealPlan.name}`,
        description: "Meal plan details loaded.",
      });
    }
  };

  const handleSubscribe = () => {
    unlockPremiumMutation.mutate();
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden card-shadow group hover:shadow-xl transition">
        <div className="h-40 overflow-hidden relative">
          <img 
            src={mealPlan.imageUrl} 
            alt={mealPlan.name} 
            className="w-full h-full object-cover transition group-hover:scale-105"
          />
          {mealPlan.isPremium && (
            <div className="absolute top-0 right-0 m-2">
              <Badge variant="outline" className="bg-gray-800 text-white">Premium</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-1">{mealPlan.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {mealPlan.description}
          </p>
          
          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge variant="secondary" className="text-xs rounded-full">
              7-day plan
            </Badge>
            <Badge variant="secondary" className="text-xs rounded-full">
              {mealPlan.calorieRange}
            </Badge>
            <Badge variant="secondary" className="text-xs rounded-full">
              {mealPlan.dietType}
            </Badge>
          </div>
          
          <Button 
            variant={mealPlan.isPremium && !isPremium ? "outline" : "default"} 
            className="w-full"
            onClick={handleViewPlan}
            disabled={unlockPremiumMutation.isPending}
          >
            {mealPlan.isPremium && !isPremium ? "Unlock with Premium" : "View Plan"}
          </Button>
        </div>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            <p className="mb-4">
              This meal plan is only available to premium subscribers. Upgrade now to unlock all premium content!
            </p>
            <p className="font-bold mb-6">Premium features include:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Unlimited access to all premium meal plans</li>
              <li>Personalized AI-powered nutrition recommendations</li>
              <li>Weekly new meal suggestions based on your preferences</li>
              <li>Detailed nutrition tracking and insights</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={handleSubscribe}
              disabled={unlockPremiumMutation.isPending}
            >
              {unlockPremiumMutation.isPending ? 
                "Processing..." : 
                "Upgrade to Premium - $9.99/month"
              }
            </Button>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Crown, Package, RefreshCw, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionPrompt() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const subscribeMutation = useMutation({
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
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = () => {
    subscribeMutation.mutate();
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20 rounded-xl p-6 border border-primary-500/20 relative overflow-hidden">
      <div className="absolute right-0 top-0 transform translate-x-1/4 -translate-y-1/4 opacity-10">
        <div className="w-64 h-64 rounded-full bg-primary-500"></div>
      </div>
      
      <div className="max-w-2xl">
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
          Unlock Premium AI Meal Plans
        </h3>
        <p className="mb-4">
          Get access to personalized meal plans created by our advanced AI based on your unique dietary needs, preferences, and goals.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm">Personalized to your dietary needs</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm">Weekly new meal suggestions</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm">Automated shopping lists</span>
          </div>
        </div>
        
        <Button 
          className="py-3 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-full font-medium shadow-lg shadow-primary-500/20 transition flex items-center gap-2"
          onClick={handleSubscribe}
          disabled={subscribeMutation.isPending}
        >
          <Crown className="h-4 w-4" />
          <span>
            {subscribeMutation.isPending ? 
              "Processing..." : 
              "Upgrade to Premium - $9.99/month"
            }
          </span>
        </Button>
      </div>
    </div>
  );
}

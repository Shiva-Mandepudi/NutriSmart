import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Plus } from "lucide-react";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WaterIntake } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function WaterIntakeCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [waterGoal] = useState(2500); // 2.5L - could come from user preferences
  
  const { data: waterEntries, isLoading } = useQuery<WaterIntake[]>({
    queryKey: ['/api/water'],
  });

  // Filter today's water intake
  const todayWaterEntries = waterEntries?.filter(entry => {
    const entryDate = new Date(entry.date);
    const today = new Date();
    return entryDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  }) || [];

  // Calculate total water intake today
  const totalWaterIntake = todayWaterEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const waterIntakePercentage = Math.min(100, Math.floor((totalWaterIntake / waterGoal) * 100));
  
  // Add water mutation
  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/water", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/water'] });
      toast({
        title: "Water intake added",
        description: "Your water intake has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add water intake",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddWater = (amount: number) => {
    addWaterMutation.mutate(amount);
  };

  if (isLoading) {
    return <WaterIntakeCardSkeleton />;
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Water Intake</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-500 text-sm font-medium"
            onClick={() => handleAddWater(250)} // Add 250ml by default when clicking "Add"
            disabled={addWaterMutation.isPending}
          >
            Add
          </Button>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <div className="w-28 h-28 relative animate-pulse-slow">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="3"
                className="dark:stroke-gray-700" />
              <path d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4fa1e0"
                strokeWidth="3"
                strokeDasharray={`${waterIntakePercentage}, 100`}
                className="dark:stroke-blue-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplet className="text-blue-500 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {(totalWaterIntake / 1000).toFixed(1)}L
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            of {waterGoal / 1000}L goal
          </p>
          
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              onClick={() => handleAddWater(250)}
              disabled={addWaterMutation.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`inline-block w-6 h-6 -mr-1 rounded-full border-2 border-white dark:border-gray-800 ${
                    index < Math.ceil(waterIntakePercentage / 20)
                      ? "bg-blue-300"
                      : "bg-blue-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WaterIntakeCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        
        <div className="flex items-center justify-center my-4">
          <Skeleton className="w-28 h-28 rounded-full" />
        </div>
        
        <div className="text-center">
          <Skeleton className="h-6 w-20 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto mb-4" />
          
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-6 h-6 rounded-full -mr-1" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

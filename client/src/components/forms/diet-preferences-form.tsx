import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DietaryPreferences } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const dietPreferenceSchema = z.object({
  type: z.enum([
    "omnivore", 
    "vegetarian", 
    "vegan", 
    "pescatarian", 
    "keto", 
    "paleo", 
    "gluten_free", 
    "dairy_free"
  ]),
  goals: z.enum([
    "weight_loss", 
    "weight_gain", 
    "maintenance", 
    "muscle_building", 
    "general_health"
  ]),
});

interface DietPreferencesFormProps {
  onSuccess?: () => void;
}

export function DietPreferencesForm({ onSuccess }: DietPreferencesFormProps) {
  const { user, updateProfileMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For managing arrays
  const [allergies, setAllergies] = useState<string[]>(
    user?.dietaryPreferences?.allergies || []
  );
  const [allergyInput, setAllergyInput] = useState("");
  
  const [dislikedFoods, setDislikedFoods] = useState<string[]>(
    user?.dietaryPreferences?.dislikedFoods || []
  );
  const [dislikedFoodInput, setDislikedFoodInput] = useState("");

  const form = useForm<z.infer<typeof dietPreferenceSchema>>({
    resolver: zodResolver(dietPreferenceSchema),
    defaultValues: {
      type: user?.dietaryPreferences?.type || "omnivore",
      goals: user?.dietaryPreferences?.goals || "general_health",
    },
  });

  function onSubmit(values: z.infer<typeof dietPreferenceSchema>) {
    const dietaryPreferences: DietaryPreferences = {
      ...values,
      allergies,
      dislikedFoods,
    };
    
    updateProfileMutation.mutate(
      { dietaryPreferences },
      {
        onSuccess: () => {
          toast({
            title: "Preferences updated",
            description: "Your dietary preferences have been saved.",
          });
          if (onSuccess) onSuccess();
        }
      }
    );
  }

  const handleAddAllergy = () => {
    if (allergyInput.trim() !== "") {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddDislikedFood = () => {
    if (dislikedFoodInput.trim() !== "") {
      setDislikedFoods([...dislikedFoods, dislikedFoodInput.trim()]);
      setDislikedFoodInput("");
    }
  };

  const handleRemoveDislikedFood = (index: number) => {
    setDislikedFoods(dislikedFoods.filter((_, i) => i !== index));
  };

  const dietTypeLabels = {
    omnivore: "Omnivore (Eat everything)",
    vegetarian: "Vegetarian (No meat)",
    vegan: "Vegan (No animal products)",
    pescatarian: "Pescatarian (Fish but no meat)",
    keto: "Keto (Low carb, high fat)",
    paleo: "Paleo (Prehistoric diet)",
    gluten_free: "Gluten-free",
    dairy_free: "Dairy-free"
  };

  const goalsLabels = {
    weight_loss: "Weight Loss",
    weight_gain: "Weight Gain",
    maintenance: "Maintenance",
    muscle_building: "Muscle Building",
    general_health: "General Health"
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diet Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your diet type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(dietTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the dietary pattern that best matches your eating habits.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goals"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Nutrition Goals</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {Object.entries(goalsLabels).map(([value, label]) => (
                    <FormItem key={value} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={value} />
                      </FormControl>
                      <FormLabel className="font-normal">{label}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select your primary nutritional goal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormItem>
            <FormLabel>Allergies or Intolerances</FormLabel>
            <div className="flex gap-2">
              <Input 
                placeholder="Add an allergy" 
                value={allergyInput} 
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddAllergy}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormDescription>
              List any foods you're allergic to or can't tolerate.
            </FormDescription>
            {allergies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{allergy}</span>
                    <button 
                      type="button"
                      className="text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => handleRemoveAllergy(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormItem>

          <FormItem>
            <FormLabel>Disliked Foods</FormLabel>
            <div className="flex gap-2">
              <Input 
                placeholder="Add a disliked food" 
                value={dislikedFoodInput} 
                onChange={(e) => setDislikedFoodInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDislikedFood();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddDislikedFood}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormDescription>
              List foods you dislike and want to avoid in your meal plans.
            </FormDescription>
            {dislikedFoods.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {dislikedFoods.map((food, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{food}</span>
                    <button 
                      type="button"
                      className="text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => handleRemoveDislikedFood(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormItem>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </form>
    </Form>
  );
}

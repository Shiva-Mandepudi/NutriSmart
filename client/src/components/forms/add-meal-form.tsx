import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMealSchema, InsertMeal } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Form,
  FormControl,
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
import { Loader2 } from "lucide-react";

// Extend the meal schema to ensure positive numbers for macros
const addMealSchema = insertMealSchema.extend({
  calories: z.coerce.number().min(1, "Calories must be at least 1"),
  protein: z.coerce.number().min(0, "Protein cannot be negative"),
  carbs: z.coerce.number().min(0, "Carbs cannot be negative"),
  fats: z.coerce.number().min(0, "Fats cannot be negative"),
});

interface AddMealFormProps {
  onSuccess?: () => void;
  defaultMealType?: string;
}

export function AddMealForm({ onSuccess, defaultMealType }: AddMealFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  const form = useForm<z.infer<typeof addMealSchema>>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      name: "",
      mealType: defaultMealType || "breakfast",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      ingredients: [],
      date: new Date().toISOString(),
    },
  });

  const addMealMutation = useMutation({
    mutationFn: async (values: z.infer<typeof addMealSchema>) => {
      // Add the ingredients to the form data
      const mealData = { ...values, ingredients };
      const res = await apiRequest("POST", "/api/meals", mealData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      toast({
        title: "Meal added successfully",
        description: "Your meal has been logged.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof addMealSchema>) {
    addMealMutation.mutate(values);
  }

  const handleAddIngredient = () => {
    if (ingredientInput.trim() !== "") {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Greek Yogurt with Berries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mealType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 320" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 18" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbs (g)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 24" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fats (g)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Ingredients</FormLabel>
          <div className="flex gap-2 mb-2">
            <Input 
              placeholder="Add an ingredient" 
              value={ingredientInput} 
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddIngredient();
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddIngredient}
            >
              Add
            </Button>
          </div>
          {ingredients.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingredients:</p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{ingredient}</span>
                    <button 
                      type="button"
                      className="text-gray-500 hover:text-red-500 focus:outline-none"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={addMealMutation.isPending}
        >
          {addMealMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Add Meal"
          )}
        </Button>
      </form>
    </Form>
  );
}

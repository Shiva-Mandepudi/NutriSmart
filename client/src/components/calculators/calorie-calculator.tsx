import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const calorieSchema = z.object({
  age: z.number().min(15, "Must be at least 15 years old").max(100, "Must be under 100 years old"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender",
  }),
  weight: z.number().positive("Weight must be positive"),
  height: z.number().positive("Height must be positive"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very-active"], {
    required_error: "Please select an activity level",
  }),
  goal: z.enum(["lose", "maintain", "gain"], {
    required_error: "Please select a goal",
  }),
});

type CalorieFormValues = z.infer<typeof calorieSchema>;

export function CalorieCalculator() {
  const { user, updateProfileMutation } = useAuth();
  const [result, setResult] = useState<{
    bmr: number;
    maintenance: number;
    target: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);
  
  const form = useForm<CalorieFormValues>({
    resolver: zodResolver(calorieSchema),
    defaultValues: {
      age: 30,
      gender: "male",
      weight: user?.weightKg || 70,
      height: user?.heightCm || 170,
      activityLevel: "moderate",
      goal: "maintain",
    },
  });
  
  const onSubmit = (values: CalorieFormValues) => {
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    
    if (values.gender === "male") {
      bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age + 5;
    } else {
      bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age - 161;
    }
    
    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2, // Little or no exercise
      light: 1.375, // Light exercise 1-3 days per week
      moderate: 1.55, // Moderate exercise 3-5 days per week
      active: 1.725, // Hard exercise 6-7 days per week
      "very-active": 1.9, // Very hard exercise and physical job
    };
    
    const maintenance = bmr * activityMultipliers[values.activityLevel];
    
    // Adjust based on goal
    let target: number;
    
    if (values.goal === "lose") {
      target = maintenance - 500; // 500 calorie deficit for weight loss
    } else if (values.goal === "gain") {
      target = maintenance + 500; // 500 calorie surplus for weight gain
    } else {
      target = maintenance; // Maintain current weight
    }
    
    // Calculate macros (example distribution)
    // Protein: 30%, Carbs: 40%, Fats: 30%
    const protein = Math.round((target * 0.3) / 4); // 4 calories per gram of protein
    const carbs = Math.round((target * 0.4) / 4); // 4 calories per gram of carbs
    const fats = Math.round((target * 0.3) / 9); // 9 calories per gram of fat
    
    setResult({
      bmr: Math.round(bmr),
      maintenance: Math.round(maintenance),
      target: Math.round(target),
      protein,
      carbs,
      fats,
    });
    
    // Update user's calorie goal if they have an account
    if (user) {
      updateProfileMutation.mutate({ calorieGoal: Math.round(target) });
    }
  };
  
  const activityOptions = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "light", label: "Lightly Active (light exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderately Active (moderate exercise 3-5 days/week)" },
    { value: "active", label: "Very Active (hard exercise 6-7 days/week)" },
    { value: "very-active", label: "Extremely Active (very hard exercise & physical job)" },
  ];

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Daily Calorie Calculator</h3>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Age in years" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Weight in kilograms" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Height in centimeters" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lose" />
                        </FormControl>
                        <FormLabel className="font-normal">Lose Weight</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="maintain" />
                        </FormControl>
                        <FormLabel className="font-normal">Maintain</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="gain" />
                        </FormControl>
                        <FormLabel className="font-normal">Gain Weight</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Calculate Calories
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Basal Metabolic Rate</h4>
                <p className="text-2xl font-bold">{result.bmr}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">calories/day</p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Maintenance Calories</h4>
                <p className="text-2xl font-bold">{result.maintenance}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">calories/day</p>
              </div>
              
              <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                <h4 className="text-sm text-primary-600 dark:text-primary-400 mb-1">Your Target Calories</h4>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{result.target}</p>
                <p className="text-xs text-primary-500 dark:text-primary-400">calories/day</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Recommended Macronutrients</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-center">
                  <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400">Protein</h5>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.protein}g</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400">{Math.round(result.protein * 4)} calories</p>
                </div>
                
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center">
                  <h5 className="text-sm font-medium text-green-600 dark:text-green-400">Carbs</h5>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.carbs}g</p>
                  <p className="text-xs text-green-500 dark:text-green-400">{Math.round(result.carbs * 4)} calories</p>
                </div>
                
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-center">
                  <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Fats</h5>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{result.fats}g</p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-400">{Math.round(result.fats * 9)} calories</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What's Next?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Track your daily food intake to ensure you're meeting these targets. Adjust based on your progress and how you feel.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="gap-2">
                  Save Results
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

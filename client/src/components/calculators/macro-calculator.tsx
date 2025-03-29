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
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Slider 
} from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  PieChart, 
  Dumbbell,
  Beef,
  Wheat,
  Droplets
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThreeDModel } from "@/components/ui/3d-food-model";

const macroSchema = z.object({
  dietType: z.enum(["balanced", "lowCarb", "highProtein", "keto", "vegan"], {
    required_error: "Please select a diet type",
  }),
  calorieTarget: z.number().min(1000, "Calorie target must be at least 1000").max(5000, "Calorie target must be under 5000"),
  proteinPercentage: z.number().min(10, "Protein must be at least 10%").max(60, "Protein must be under 60%"),
  carbPercentage: z.number().min(10, "Carbs must be at least 10%").max(70, "Carbs must be under 70%"),
  fatPercentage: z.number().min(10, "Fat must be at least 10%").max(70, "Fat must be under 70%"),
});

type MacroFormValues = z.infer<typeof macroSchema>;

export function MacroCalculator() {
  const { user } = useAuth();
  const [result, setResult] = useState<{
    protein: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fats: { grams: number; calories: number; percentage: number };
  } | null>(null);
  
  const [activeMacro, setActiveMacro] = useState<"protein" | "carb" | "fat">("protein");
  
  const form = useForm<MacroFormValues>({
    resolver: zodResolver(macroSchema),
    defaultValues: {
      dietType: "balanced",
      calorieTarget: user?.calorieGoal || 2000,
      proteinPercentage: 30,
      carbPercentage: 40,
      fatPercentage: 30,
    },
  });
  
  const watchProtein = form.watch("proteinPercentage");
  const watchCarbs = form.watch("carbPercentage");
  const watchFat = form.watch("fatPercentage");
  const totalPercentage = watchProtein + watchCarbs + watchFat;
  
  // Auto-adjust macros to ensure total equals 100%
  const handleMacroChange = (type: "protein" | "carb" | "fat", value: number) => {
    if (type === "protein") {
      form.setValue("proteinPercentage", value);
      const remaining = 100 - value;
      const carbRatio = watchCarbs / (watchCarbs + watchFat) || 0.5;
      form.setValue("carbPercentage", Math.round(remaining * carbRatio));
      form.setValue("fatPercentage", 100 - value - Math.round(remaining * carbRatio));
    } else if (type === "carb") {
      form.setValue("carbPercentage", value);
      const remaining = 100 - value;
      const proteinRatio = watchProtein / (watchProtein + watchFat) || 0.5;
      form.setValue("proteinPercentage", Math.round(remaining * proteinRatio));
      form.setValue("fatPercentage", 100 - value - Math.round(remaining * proteinRatio));
    } else {
      form.setValue("fatPercentage", value);
      const remaining = 100 - value;
      const proteinRatio = watchProtein / (watchProtein + watchCarbs) || 0.5;
      form.setValue("proteinPercentage", Math.round(remaining * proteinRatio));
      form.setValue("carbPercentage", 100 - value - Math.round(remaining * proteinRatio));
    }
  };
  
  // Apply preset macro distributions
  const applyPreset = (preset: string) => {
    switch (preset) {
      case "balanced":
        form.setValue("proteinPercentage", 30);
        form.setValue("carbPercentage", 40);
        form.setValue("fatPercentage", 30);
        break;
      case "lowCarb":
        form.setValue("proteinPercentage", 40);
        form.setValue("carbPercentage", 20);
        form.setValue("fatPercentage", 40);
        break;
      case "highProtein":
        form.setValue("proteinPercentage", 50);
        form.setValue("carbPercentage", 30);
        form.setValue("fatPercentage", 20);
        break;
      case "keto":
        form.setValue("proteinPercentage", 25);
        form.setValue("carbPercentage", 5);
        form.setValue("fatPercentage", 70);
        break;
      case "vegan":
        form.setValue("proteinPercentage", 25);
        form.setValue("carbPercentage", 55);
        form.setValue("fatPercentage", 20);
        break;
    }
  };
  
  const onSubmit = (values: MacroFormValues) => {
    // Ensure percentages add up to 100
    if (values.proteinPercentage + values.carbPercentage + values.fatPercentage !== 100) {
      const adjustedProtein = Math.round(100 * values.proteinPercentage / totalPercentage);
      const adjustedCarbs = Math.round(100 * values.carbPercentage / totalPercentage);
      const adjustedFat = 100 - adjustedProtein - adjustedCarbs;
      
      values.proteinPercentage = adjustedProtein;
      values.carbPercentage = adjustedCarbs;
      values.fatPercentage = adjustedFat;
    }
    
    // Calculate macros in grams
    const proteinCals = Math.round(values.calorieTarget * (values.proteinPercentage / 100));
    const carbCals = Math.round(values.calorieTarget * (values.carbPercentage / 100));
    const fatCals = Math.round(values.calorieTarget * (values.fatPercentage / 100));
    
    const proteinGrams = Math.round(proteinCals / 4); // 4 calories per gram of protein
    const carbGrams = Math.round(carbCals / 4); // 4 calories per gram of carbs
    const fatGrams = Math.round(fatCals / 9); // 9 calories per gram of fat
    
    setResult({
      protein: {
        grams: proteinGrams,
        calories: proteinCals,
        percentage: values.proteinPercentage,
      },
      carbs: {
        grams: carbGrams,
        calories: carbCals,
        percentage: values.carbPercentage,
      },
      fats: {
        grams: fatGrams,
        calories: fatCals,
        percentage: values.fatPercentage,
      },
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Macronutrient Calculator</h3>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      applyPreset(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your diet type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="lowCarb">Low Carb</SelectItem>
                      <SelectItem value="highProtein">High Protein</SelectItem>
                      <SelectItem value="keto">Ketogenic</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a diet type to automatically set macro ratios, or customize below
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="calorieTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Calorie Target</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        onValueChange={([v]) => field.onChange(v)}
                        value={[field.value]}
                        max={5000}
                        min={1000}
                        step={50}
                        className="flex-grow"
                      />
                      <span className="font-medium min-w-16 text-center">{field.value} cal</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-6">
              <h4 className="font-medium">Macronutrient Distribution</h4>
              
              <div className="flex items-center gap-8">
                <div className="flex-grow">
                  <div className="relative h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="absolute h-full bg-blue-500" 
                      style={{ width: `${watchProtein}%` }}
                    ></div>
                    <div 
                      className="absolute h-full bg-green-500" 
                      style={{ left: `${watchProtein}%`, width: `${watchCarbs}%` }}
                    ></div>
                    <div 
                      className="absolute h-full bg-yellow-500" 
                      style={{ left: `${watchProtein + watchCarbs}%`, width: `${watchFat}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm font-medium">
                  {totalPercentage}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="proteinPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Protein ({field.value}%)
                      </FormLabel>
                      <FormControl>
                        <Slider
                          onValueChange={([v]) => handleMacroChange("protein", v)}
                          value={[field.value]}
                          max={60}
                          min={10}
                          step={1}
                          onClick={() => setActiveMacro("protein")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carbPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Carbs ({field.value}%)
                      </FormLabel>
                      <FormControl>
                        <Slider
                          onValueChange={([v]) => handleMacroChange("carb", v)}
                          value={[field.value]}
                          max={70}
                          min={10}
                          step={1}
                          onClick={() => setActiveMacro("carb")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fatPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        Fats ({field.value}%)
                      </FormLabel>
                      <FormControl>
                        <Slider
                          onValueChange={([v]) => handleMacroChange("fat", v)}
                          value={[field.value]}
                          max={70}
                          min={10}
                          step={1}
                          onClick={() => setActiveMacro("fat")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Calculate Macros
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center 
                  ${activeMacro === "protein" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setActiveMacro("protein")}
              >
                <div className="flex items-center justify-center mb-2">
                  <Beef className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-sm text-blue-800 dark:text-blue-300 mb-1">Protein</h4>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.protein.grams}g</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {result.protein.calories} cal ({result.protein.percentage}%)
                </p>
              </div>
              
              <div 
                className={`bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center 
                  ${activeMacro === "carb" ? "ring-2 ring-green-500" : ""}`}
                onClick={() => setActiveMacro("carb")}
              >
                <div className="flex items-center justify-center mb-2">
                  <Wheat className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-sm text-green-800 dark:text-green-300 mb-1">Carbohydrates</h4>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.carbs.grams}g</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {result.carbs.calories} cal ({result.carbs.percentage}%)
                </p>
              </div>
              
              <div 
                className={`bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg text-center 
                  ${activeMacro === "fat" ? "ring-2 ring-yellow-500" : ""}`}
                onClick={() => setActiveMacro("fat")}
              >
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h4 className="text-sm text-yellow-800 dark:text-yellow-300 mb-1">Fats</h4>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{result.fats.grams}g</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {result.fats.calories} cal ({result.fats.percentage}%)
                </p>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Food Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Protein Sources</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Chicken breast (31g per 100g)</li>
                    <li>• Greek yogurt (10g per 100g)</li>
                    <li>• Lentils (9g per 100g)</li>
                    <li>• Tofu (8g per 100g)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Carb Sources</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Brown rice (23g per 100g)</li>
                    <li>• Sweet potatoes (20g per 100g)</li>
                    <li>• Oats (66g per 100g)</li>
                    <li>• Quinoa (21g per 100g)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">Fat Sources</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Avocado (15g per 100g)</li>
                    <li>• Olive oil (100g per 100g)</li>
                    <li>• Nuts (50-70g per 100g)</li>
                    <li>• Fatty fish (10-20g per 100g)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

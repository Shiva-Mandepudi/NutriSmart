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
  CardContent, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Progress,
} from "@/components/ui/progress";
import { 
  Scale, 
  ArrowRight, 
  Calculator 
} from "lucide-react";

const bmiSchema = z.object({
  height: z.number().positive("Height must be positive"),
  weight: z.number().positive("Weight must be positive"),
});

type BMIFormValues = z.infer<typeof bmiSchema>;

export function BMICalculator() {
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    color: string;
    explanation: string;
  } | null>(null);
  const [activeUnit, setActiveUnit] = useState<"metric" | "imperial">("metric");
  
  const form = useForm<BMIFormValues>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      height: 0,
      weight: 0,
    },
  });
  
  const onSubmit = (values: BMIFormValues) => {
    let bmi: number;
    
    if (activeUnit === "metric") {
      // Height in cm, weight in kg
      bmi = values.weight / Math.pow(values.height / 100, 2);
    } else {
      // Height in inches, weight in pounds
      bmi = (values.weight * 703) / Math.pow(values.height, 2);
    }
    
    bmi = parseFloat(bmi.toFixed(1));
    
    let category: string;
    let color: string;
    let explanation: string;
    
    if (bmi < 18.5) {
      category = "Underweight";
      color = "bg-blue-500";
      explanation = "A BMI under 18.5 indicates you may be underweight. Consider consulting with a healthcare professional about healthy ways to gain weight.";
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Healthy Weight";
      color = "bg-green-500";
      explanation = "A BMI between 18.5 and 24.9 indicates a healthy weight range. Maintaining a healthy weight can lower your risk of developing health problems.";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "bg-yellow-500";
      explanation = "A BMI between 25 and 29.9 indicates you may be overweight. Consider consulting with a healthcare professional about healthy ways to manage your weight.";
    } else {
      category = "Obesity";
      color = "bg-red-500";
      explanation = "A BMI of 30 or higher indicates obesity. Obesity can increase your risk of developing health problems. Consider consulting with a healthcare professional about weight management strategies.";
    }
    
    setResult({ bmi, category, color, explanation });
  };
  
  const getProgressPercentage = (bmi: number) => {
    // Calculate percentage for progress bar (0-50 BMI scale)
    const percentage = Math.min(100, (bmi / 50) * 100);
    return percentage;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Body Mass Index (BMI) Calculator</h3>
          </div>
          <Tabs value={activeUnit} onValueChange={(value) => setActiveUnit(value as "metric" | "imperial")}>
            <TabsList>
              <TabsTrigger value="metric">Metric</TabsTrigger>
              <TabsTrigger value="imperial">Imperial</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={activeUnit === "metric" ? "Height in centimeters" : "Height in inches"} 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormDescription>
                      {activeUnit === "metric" ? "Enter your height in centimeters (cm)" : "Enter your height in inches (in)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={activeUnit === "metric" ? "Weight in kilograms" : "Weight in pounds"} 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormDescription>
                      {activeUnit === "metric" ? "Enter your weight in kilograms (kg)" : "Enter your weight in pounds (lbs)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Calculate BMI
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h4 className="text-xl font-semibold">Your BMI: {result.bmi}</h4>
              <p className="font-medium text-lg mt-1">
                Category: <span className={`inline-block px-2 py-1 rounded-full text-white ${result.color}`}>{result.category}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obesity</span>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 w-full"></div>
                <div 
                  className="absolute top-0 h-full w-1 bg-black dark:bg-white" 
                  style={{ left: `${getProgressPercentage(result.bmi)}%`, transform: 'translateX(-50%)' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>50</span>
              </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm">{result.explanation}</p>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                <strong>Note:</strong> BMI is not a diagnostic tool and has limitations. It doesn't account for muscle mass, bone density, or overall body composition.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// Calculate is working fine
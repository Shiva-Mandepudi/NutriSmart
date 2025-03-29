import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BMICalculator } from "@/components/calculators/bmi-calculator";
import { CalorieCalculator } from "@/components/calculators/calorie-calculator";
import { MacroCalculator } from "@/components/calculators/macro-calculator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Calculator,
  Flame,
  Dumbbell
} from "lucide-react";
import { ThreeDModel } from "@/components/ui/3d-food-model";

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState("bmi");
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Health Calculators</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Use our AI-powered calculators to determine your health metrics and nutrition needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="bmi" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span>BMI</span>
                  </TabsTrigger>
                  <TabsTrigger value="calories" className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    <span>Calories</span>
                  </TabsTrigger>
                  <TabsTrigger value="macros" className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Macros</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="bmi">
                  <BMICalculator />
                </TabsContent>
                
                <TabsContent value="calories">
                  <CalorieCalculator />
                </TabsContent>
                
                <TabsContent value="macros">
                  <MacroCalculator />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full shadow-md">
                <h3 className="text-xl font-bold mb-4 text-center">Nutrition Visualization</h3>
                
                <div className="mb-8 flex justify-center">
                  <ThreeDModel 
                    modelType={activeTab === "macros" ? "protein" : activeTab === "calories" ? "plate" : "carb"} 
                    animate={true}
                    size="lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
                    {activeTab === "bmi" 
                      ? "Why BMI Matters" 
                      : activeTab === "calories" 
                        ? "Optimizing Your Caloric Intake" 
                        : "Balancing Your Macros"}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeTab === "bmi" 
                      ? "BMI provides a simple numeric measure of your weight relative to height. It helps identify potential weight problems and associated health risks."
                      : activeTab === "calories" 
                        ? "Understanding your caloric needs helps maintain, lose, or gain weight. Proper energy balance is essential for achieving your health and fitness goals."
                        : "Macronutrients (proteins, carbs, and fats) serve different functions in your body. Tailoring your macro ratio can optimize performance, recovery, and body composition."}
                  </p>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-md border border-primary-100 dark:border-primary-900/20">
                    <p className="text-sm italic">
                      <span className="font-semibold">AI Insight:</span> {activeTab === "bmi" 
                        ? "While BMI is useful as a screening tool, it doesn't account for muscle mass, bone density, or body composition. Consider it alongside other health metrics."
                        : activeTab === "calories" 
                          ? "Your calorie needs change based on activity levels, age, and goals. Regular recalculation ensures continued progress."
                          : "For most active individuals, a balanced ratio of 30% protein, 40% carbs, and 30% fats supports both performance and body composition goals."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <MobileNav />
    </div>
  );
}

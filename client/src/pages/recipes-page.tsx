import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Search, 
  ChefHat, 
  Filter, 
  Plus, 
  Bookmark,
  Clock3,
  Users
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { MealPlan } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ThreeDModel } from "@/components/ui/3d-model";

interface Recipe {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  dietType: string;
}

export default function RecipesPage() {
  // In a real app, this would come from an API
  const sampleRecipes: Recipe[] = [
    {
      id: 1,
      name: "Greek Yogurt Bowl",
      description: "A protein-packed breakfast to start your day right",
      imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 320,
      protein: 18,
      carbs: 24,
      fats: 12,
      ingredients: [
        "1 cup Greek yogurt",
        "1/2 cup mixed berries",
        "1 tbsp honey",
        "2 tbsp granola"
      ],
      instructions: [
        "Add Greek yogurt to a bowl",
        "Top with mixed berries",
        "Drizzle with honey",
        "Sprinkle granola on top"
      ],
      tags: ["breakfast", "vegetarian", "quick"],
      dietType: "vegetarian"
    },
    {
      id: 2,
      name: "Grilled Chicken Salad",
      description: "Lean protein and fresh vegetables for a satisfying lunch",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      prepTime: 10,
      cookTime: 15,
      servings: 1,
      calories: 520,
      protein: 35,
      carbs: 30,
      fats: 20,
      ingredients: [
        "4 oz chicken breast",
        "2 cups mixed greens",
        "1/2 cup cherry tomatoes",
        "1/4 cucumber, sliced",
        "2 tbsp olive oil",
        "1 tbsp balsamic vinegar",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Season chicken breast with salt and pepper",
        "Grill chicken for 6-7 minutes per side until cooked through",
        "Let chicken rest for 5 minutes before slicing",
        "Combine mixed greens, cherry tomatoes, and cucumber in a bowl",
        "Whisk together olive oil and balsamic vinegar for dressing",
        "Slice chicken and place on top of salad",
        "Drizzle with dressing"
      ],
      tags: ["lunch", "high-protein", "keto-friendly"],
      dietType: "omnivore"
    },
    {
      id: 3,
      name: "Vegan Buddha Bowl",
      description: "A nutritious and colorful plant-based meal",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      prepTime: 15,
      cookTime: 30,
      servings: 2,
      calories: 450,
      protein: 15,
      carbs: 65,
      fats: 18,
      ingredients: [
        "1 cup quinoa",
        "1 sweet potato, diced",
        "1 cup chickpeas, drained and rinsed",
        "1 avocado, sliced",
        "1 cup spinach",
        "1/4 cup tahini",
        "1 tbsp lemon juice",
        "1 clove garlic, minced",
        "2 tbsp olive oil",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Cook quinoa according to package instructions",
        "Preheat oven to 400°F (200°C)",
        "Toss sweet potato in olive oil, salt, and pepper",
        "Roast sweet potato for 25-30 minutes until tender",
        "Mix tahini, lemon juice, garlic, and water to make dressing",
        "Assemble bowl with quinoa, sweet potato, chickpeas, avocado, and spinach",
        "Drizzle with tahini dressing"
      ],
      tags: ["dinner", "vegan", "plant-based"],
      dietType: "vegan"
    }
  ];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Filter recipes based on search and active tab
  const filteredRecipes = sampleRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === "all" || recipe.dietType === activeTab;
    
    return matchesSearch && matchesTab;
  });
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
     
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Recipes Collection</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover delicious and nutritious recipes for every meal
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                className="pl-10" 
                placeholder="Search recipes, ingredients, or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button className="gap-2">
                <Plus size={18} />
                <span className="hidden sm:inline">Add Recipe</span>
              </Button>
            </div>
          </div>
          
          {/* Recipe Categories */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4 overflow-x-auto flex whitespace-nowrap px-1 pb-px justify-start max-w-full">
              <TabsTrigger value="all">All Recipes</TabsTrigger>
              <TabsTrigger value="omnivore">Omnivore</TabsTrigger>
              <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
              <TabsTrigger value="vegan">Vegan</TabsTrigger>
              <TabsTrigger value="keto">Keto</TabsTrigger>
              <TabsTrigger value="paleo">Paleo</TabsTrigger>
            </TabsList>
            
            {/* Recipe Cards */}
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 bg-white/80 dark:bg-black/50 rounded-full"
                        >
                          <Bookmark className="h-5 w-5" />
                        </Button>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex gap-2 flex-wrap">
                          {recipe.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="text-lg mt-2">{recipe.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock3 size={14} />
                            <span>{recipe.prepTime + recipe.cookTime} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{recipe.servings} serv</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{recipe.calories}</span>
                            <span>kcal</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          View Recipe
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center py-12">
                    <ChefHat className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                      No recipes found
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription>{selectedRecipe.description}</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="rounded-md overflow-hidden mb-4">
                    <img 
                      src={selectedRecipe.imageUrl} 
                      alt={selectedRecipe.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-center">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Prep Time</p>
                      <p className="font-medium">{selectedRecipe.prepTime} min</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-center">
                      <Clock3 className="h-5 w-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cook Time</p>
                      <p className="font-medium">{selectedRecipe.cookTime} min</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Servings</p>
                      <p className="font-medium">{selectedRecipe.servings}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Nutrition Facts</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 border rounded-md text-center">
                        <p className="font-medium">{selectedRecipe.calories}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">calories</p>
                      </div>
                      <div className="p-2 border rounded-md text-center">
                        <p className="font-medium">{selectedRecipe.protein}g</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">protein</p>
                      </div>
                      <div className="p-2 border rounded-md text-center">
                        <p className="font-medium">{selectedRecipe.carbs}g</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">carbs</p>
                      </div>
                      <div className="p-2 border rounded-md text-center">
                        <p className="font-medium">{selectedRecipe.fats}g</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">fats</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Interactive Nutrition Model</h3>
                    <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                      <ThreeDModel modelType="plate" size="md" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Ingredients</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full border border-gray-300 mt-1"></div>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <ol className="space-y-4">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-medium text-sm">
                            {index + 1}
                          </div>
                          <p>{instruction}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save Recipe
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add to Meal Plan
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
}

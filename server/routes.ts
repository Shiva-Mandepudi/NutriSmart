import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertMealSchema, 
  insertWaterIntakeSchema, 
  insertAppointmentSchema
} from "@shared/schema";
import { generateMealPlan, analyzeFood, answerNutritionQuestion } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API Routes
  // Meals CRUD
  app.get("/api/meals", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const meals = await storage.getMealsByUserId(userId);
      res.json(meals);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/meals", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Parse validation data
      const validatedData = insertMealSchema.parse({
        ...req.body,
        calories: Number(req.body.calories),
        userId
      });
      
      // Process ingredients safely
      const ingredientsArray: string[] = [];
      
      // If ingredients exist and are an array, convert each to string safely
      if (validatedData.ingredients && Array.isArray(validatedData.ingredients)) {
        for (const item of validatedData.ingredients) {
          if (item !== null && item !== undefined) {
            ingredientsArray.push(String(item));
          }
        }
      }
      
      // Create the meal with safe data
      const meal = await storage.createMeal({
        ...validatedData,
        userId,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        ingredients: ingredientsArray
      });
      
      res.status(201).json(meal);
    } catch (error) {
      console.error('Error creating meal:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meal data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/meals/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const mealId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Verify meal belongs to user
      const existingMeal = await storage.getMealById(mealId);
      if (!existingMeal || existingMeal.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to modify this meal" });
      }
      
      // Parse validation data
      const validatedData = insertMealSchema.parse(req.body);
      
      // Process ingredients safely
      const ingredientsArray: string[] = [];
      
      // If ingredients exist and are an array, convert each to string safely
      if (validatedData.ingredients && Array.isArray(validatedData.ingredients)) {
        for (const item of validatedData.ingredients) {
          if (item !== null && item !== undefined) {
            ingredientsArray.push(String(item));
          }
        }
      }
      
      // Update meal with safe data
      const updatedMeal = await storage.updateMeal(mealId, {
        ...validatedData,
        userId,
        date: validatedData.date || new Date(),
        ingredients: ingredientsArray
      });
      
      res.json(updatedMeal);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/meals/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const mealId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Verify meal belongs to user
      const existingMeal = await storage.getMealById(mealId);
      if (!existingMeal || existingMeal.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this meal" });
      }
      
      await storage.deleteMeal(mealId);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  // Water intake tracking
  app.get("/api/water", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const waterEntries = await storage.getWaterIntakeByUserId(userId);
      res.json(waterEntries);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/water", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertWaterIntakeSchema.parse(req.body);
      const waterEntry = await storage.addWaterIntake({
        ...validatedData,
        userId,
        date: validatedData.date || new Date()
      });
      
      res.status(201).json(waterEntry);
    } catch (error) {
      next(error);
    }
  });

  // Meal plans
  app.get("/api/meal-plans", async (req, res, next) => {
    try {
      const mealPlans = await storage.getAllMealPlans();
      
      // If user is not premium, filter out premium content
      if (!req.isAuthenticated() || !(await storage.isUserPremium(req.user?.id))) {
        const filteredPlans = mealPlans.map(plan => {
          if (plan.isPremium) {
            return {
              ...plan,
              content: null // Remove premium content
            };
          }
          return plan;
        });
        return res.json(filteredPlans);
      }
      
      res.json(mealPlans);
    } catch (error) {
      next(error);
    }
  });

  // Blog posts
  app.get("/api/blog", async (req, res, next) => {
    try {
      const blogPosts = await storage.getAllBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/blog/:id", async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getBlogPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      next(error);
    }
  });

  // Products
  app.get("/api/products", async (req, res, next) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const appointments = await storage.getAppointmentsByUserId(userId);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/appointments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment({
        ...validatedData,
        userId,
        status: validatedData.status || "scheduled",
        notes: validatedData.notes || null
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  });

  // Subscription
  app.post("/api/subscribe", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real app, we would implement Stripe payment processing here
      // For now, just create a subscription
      const subscription = await storage.createSubscription({
        userId,
        plan: "premium",
        startDate: new Date(),
        endDate: null, // No end date for subscription
        isActive: true
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/subscription", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const subscription = await storage.getSubscriptionByUserId(userId);
      res.json(subscription || { plan: "free" });
    } catch (error) {
      next(error);
    }
  });

  // AI-powered endpoints
  app.post("/api/ai/meal-plan", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { dietType, allergies, dislikedFoods, goals, calorieTarget } = req.body;
      
      // Check if user has premium subscription for personalized meal plans
      const isPremium = await storage.isUserPremium(userId);
      if (!isPremium) {
        return res.status(403).json({ 
          message: "Premium subscription required for personalized meal plans"
        });
      }
      
      const mealPlan = await generateMealPlan({
        dietType,
        allergies: allergies || [],
        dislikedFoods: dislikedFoods || [],
        goals,
        calorieTarget
      });
      
      res.json(mealPlan);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/ai/analyze-food", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { foodDescription } = req.body;
      if (!foodDescription) {
        return res.status(400).json({ message: "Food description is required" });
      }
      
      const analysis = await analyzeFood(foodDescription);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/ai/chat", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      const answer = await answerNutritionQuestion(question);
      res.json({ answer });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

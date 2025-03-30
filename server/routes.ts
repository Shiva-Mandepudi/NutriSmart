import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertMealSchema, 
  insertWaterIntakeSchema, 
  insertAppointmentSchema,
  insertSocialPostSchema,
  insertPostCommentSchema,
  insertChallengeSchema,
  insertChallengeParticipantSchema,
  insertCommunityRecipeSchema
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
      
      // Parse validation data - without including userId in the validation
      const validatedData = insertMealSchema.parse({
        ...req.body,
        calories: Number(req.body.calories),
        protein: Number(req.body.protein),
        carbs: Number(req.body.carbs), 
        fats: Number(req.body.fats)
      });
      
      // Process ingredients safely
      let ingredientsArray: string[] = [];
      
      // If ingredients exist and are an array, convert each to string safely
      if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
        ingredientsArray = req.body.ingredients
          .filter((item: any) => item !== null && item !== undefined)
          .map((item: any) => String(item));
      }
      
      // Create the meal with safe data
      const meal = await storage.createMeal({
        ...validatedData,
        userId,
        date: validatedData.date ? (validatedData.date instanceof Date ? validatedData.date : new Date(validatedData.date)) : new Date(),
        ingredients: ingredientsArray
      });
      
      res.status(201).json(meal);
    } catch (error) {
      console.error('Error creating meal:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meal data", errors: (error as any).errors });
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
      const validatedData = insertMealSchema.parse({
        ...req.body,
        calories: Number(req.body.calories),
        protein: Number(req.body.protein),
        carbs: Number(req.body.carbs), 
        fats: Number(req.body.fats)
      });
      
      // Process ingredients safely
      let ingredientsArray: string[] = [];
      
      // If ingredients exist and are an array, convert each to string safely
      if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
        ingredientsArray = req.body.ingredients
          .filter((item: any) => item !== null && item !== undefined)
          .map((item: any) => String(item));
      }
      
      // Update meal with safe data
      const updatedMeal = await storage.updateMeal(mealId, {
        ...validatedData,
        userId,
        date: validatedData.date ? (validatedData.date instanceof Date ? validatedData.date : new Date(validatedData.date)) : new Date(),
        ingredients: ingredientsArray
      });
      
      res.json(updatedMeal);
    } catch (error) {
      console.error('Error updating meal:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid meal data", errors: (error as any).errors });
      }
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
        date: validatedData.date ? (validatedData.date instanceof Date ? validatedData.date : new Date(validatedData.date)) : new Date()
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
      
      // Ensure date is properly converted to a Date object
      const date = typeof validatedData.date === 'string' 
        ? new Date(validatedData.date) 
        : validatedData.date;
        
      const appointment = await storage.createAppointment({
        ...validatedData,
        date,
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

  // -------------------- COMMUNITY FEATURES --------------------
  
  // Social Posts
  app.get("/api/social/posts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const posts = await storage.getAllSocialPosts();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/posts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertSocialPostSchema.parse(req.body);
      const post = await storage.createSocialPost({
        ...validatedData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
        isVisible: true
      });
      
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/posts/:id/like", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const postId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user already liked this post
      const existingLike = await storage.getPostLike(postId, userId);
      
      if (existingLike) {
        // Unlike - remove the like
        await storage.removePostLike(postId, userId);
        res.json({ liked: false });
      } else {
        // Like - add the like
        await storage.addPostLike(postId, userId);
        res.json({ liked: true });
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/social/posts/:id/comments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/posts/:id/comments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const postId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertPostCommentSchema.parse(req.body);
      const comment = await storage.createPostComment({
        ...validatedData,
        userId,
        postId,
        createdAt: new Date(),
        likesCount: 0
      });
      
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/comments/:id/like", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const commentId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user already liked this comment
      const existingLike = await storage.getCommentLike(commentId, userId);
      
      if (existingLike) {
        // Unlike - remove the like
        await storage.removeCommentLike(commentId, userId);
        res.json({ liked: false });
      } else {
        // Like - add the like
        await storage.addCommentLike(commentId, userId);
        res.json({ liked: true });
      }
    } catch (error) {
      next(error);
    }
  });

  // Challenges
  app.get("/api/social/challenges", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/social/challenges/active", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/social/challenges/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/challenges/:id/join", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const challengeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user already joined this challenge
      const existingParticipant = await storage.getChallengeParticipant(challengeId, userId);
      
      if (existingParticipant) {
        return res.status(400).json({ message: "Already joined this challenge" });
      }
      
      const participant = await storage.addChallengeParticipant({
        userId,
        challengeId,
        joinedAt: new Date(),
        progress: 0,
        isCompleted: false
      });
      
      res.status(201).json(participant);
    } catch (error) {
      next(error);
    }
  });

  // Community Recipes
  app.get("/api/social/recipes", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const recipes = await storage.getAllCommunityRecipes();
      res.json(recipes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/recipes", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertCommunityRecipeSchema.parse(req.body);
      
      // Process ingredients array safely
      let ingredientsArray: string[] = [];
      if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
        ingredientsArray = req.body.ingredients
          .filter((item: any) => item !== null && item !== undefined)
          .map((item: any) => String(item));
      }
      
      // Process instructions array safely
      let instructionsArray: string[] = [];
      if (req.body.instructions && Array.isArray(req.body.instructions)) {
        instructionsArray = req.body.instructions
          .filter((item: any) => item !== null && item !== undefined)
          .map((item: any) => String(item));
      }
      
      const recipe = await storage.createCommunityRecipe({
        ...validatedData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        isPublic: true
      });
      
      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/recipes/:id/favorite", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const recipeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if recipe is already favorited
      const existingFavorite = await storage.getRecipeFavorite(recipeId, userId);
      
      if (existingFavorite) {
        // Unfavorite
        await storage.removeRecipeFavorite(recipeId, userId);
        res.json({ favorited: false });
      } else {
        // Favorite
        await storage.addRecipeFavorite(recipeId, userId);
        res.json({ favorited: true });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/recipes/:id/rate", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user?.id;
      const recipeId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { rating, comment } = req.body;
      
      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating (must be 1-5)" });
      }
      
      // Check if user already rated this recipe
      const existingRating = await storage.getRecipeRating(recipeId, userId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateRecipeRating(existingRating.id, {
          rating,
          comment: comment || null
        });
        res.json(updatedRating);
      } else {
        // Create new rating
        const newRating = await storage.createRecipeRating({
          userId,
          recipeId,
          rating,
          comment: comment || null,
          createdAt: new Date()
        });
        res.json(newRating);
      }
    } catch (error) {
      next(error);
    }
  });

  // User Followers
  app.get("/api/social/users", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/social/users/:id/follow", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const currentUserId = req.user?.id;
      const targetUserId = parseInt(req.params.id);
      
      if (!currentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      // Check if already following
      const existingFollow = await storage.getUserFollower(targetUserId, currentUserId);
      
      if (existingFollow) {
        // Unfollow
        await storage.removeUserFollower(targetUserId, currentUserId);
        res.json({ following: false });
      } else {
        // Follow
        await storage.addUserFollower(targetUserId, currentUserId);
        res.json({ following: true });
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/social/users/:id/followers", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getUserFollowers(userId);
      res.json(followers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/social/users/:id/following", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getUserFollowing(userId);
      res.json(following);
    } catch (error) {
      next(error);
    }
  });
  
  // Follow/unfollow a user
  app.post("/api/social/users/:id/follow", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const currentUserId = req.user?.id;
      const targetUserId = parseInt(req.params.id);
      
      if (!currentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Cannot follow yourself
      if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      // Check if already following
      const isFollowing = await storage.isUserFollowing(currentUserId, targetUserId);
      
      if (isFollowing) {
        // Unfollow
        await storage.unfollowUser(currentUserId, targetUserId);
        return res.json({ following: false });
      } else {
        // Follow
        await storage.followUser(currentUserId, targetUserId);
        return res.json({ following: true });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Check if currently following a user
  app.get("/api/social/users/:id/is-following", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const currentUserId = req.user?.id;
      const targetUserId = parseInt(req.params.id);
      
      if (!currentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const isFollowing = await storage.isUserFollowing(currentUserId, targetUserId);
      return res.json({ following: isFollowing });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

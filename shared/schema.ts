import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePicture: text("profile_picture"),
  calorieGoal: integer("calorie_goal").default(2000),
  weightKg: integer("weight_kg"),
  heightCm: integer("height_cm"),
  dietaryPreferences: json("dietary_preferences").$type<DietaryPreferences>(),
});

// Meal schema
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fats: integer("fats").notNull(),
  ingredients: json("ingredients").$type<string[]>(),
  date: timestamp("date").notNull().defaultNow(),
});

// Water intake schema
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // in milliliters
  date: timestamp("date").notNull().defaultNow(),
});

// Meal plan schema
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  dietType: text("diet_type").notNull(), // keto, vegan, etc.
  calorieRange: text("calorie_range").notNull(),
  isPremium: boolean("is_premium").default(false),
  content: json("content").$type<MealPlanContent>(),
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  imageUrl: text("image_url"),
  category: text("category").notNull(),
});

// Blog post schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  publishDate: timestamp("publish_date").notNull().defaultNow(),
});

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // nutrition, wellness, fitness
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
});

// Subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  plan: text("plan").notNull(), // free, premium
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
});

// Community Challenges schema
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: text("goal").notNull(), 
  goalType: text("goal_type").notNull(), // calories, water, exercise, etc.
  goalValue: integer("goal_value").notNull(),
  rewards: text("rewards"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Challenge Participants schema
export const challengeParticipants = pgTable("challenge_participants", {
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  joinDate: timestamp("join_date").notNull().defaultNow(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedDate: timestamp("completed_date"),
}, (table) => {
  return {
    pk: primaryKey(table.challengeId, table.userId),
  };
});

// Community Recipes schema
export const communityRecipes = pgTable("community_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  ingredients: json("ingredients").$type<string[]>().notNull(),
  instructions: json("instructions").$type<string[]>().notNull(),
  prepTime: integer("prep_time").notNull(), // in minutes
  cookTime: integer("cook_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fats: integer("fats"),
  tags: json("tags").$type<string[]>(),
  dietType: text("diet_type"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Recipe Ratings schema
export const recipeRatings = pgTable("recipe_ratings", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Recipe Favorites schema
export const recipeFavorites = pgTable("recipe_favorites", {
  recipeId: integer("recipe_id").notNull(),
  userId: integer("user_id").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey(table.recipeId, table.userId),
  };
});

// Social Posts schema
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  mealId: integer("meal_id"), // Optional link to a meal
  challengeId: integer("challenge_id"), // Optional link to a challenge
  recipeId: integer("recipe_id"), // Optional link to a recipe
  type: text("type").notNull(), // achievement, milestone, recipe, challenge, general
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Post Comments schema
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Post Likes schema
export const postLikes = pgTable("post_likes", {
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey(table.postId, table.userId),
  };
});

// Comment Likes schema
export const commentLikes = pgTable("comment_likes", {
  commentId: integer("comment_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey(table.commentId, table.userId),
  };
});

// User Followers schema
export const userFollowers = pgTable("user_followers", {
  followerId: integer("follower_id").notNull(),  // The user who is following
  followingId: integer("following_id").notNull(), // The user being followed
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey(table.followerId, table.followingId),
  };
});

// Types for complex columns
export type DietaryPreferences = {
  type: "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "keto" | "paleo" | "gluten_free" | "dairy_free";
  allergies: string[];
  dislikedFoods: string[];
  goals: "weight_loss" | "weight_gain" | "maintenance" | "muscle_building" | "general_health";
};

export type MealPlanContent = {
  days: {
    day: number;
    meals: {
      type: "breakfast" | "lunch" | "dinner" | "snack";
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      recipe: string;
    }[];
  }[];
};

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Create insert schema with enhanced date handling
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, userId: true })
  .extend({
    // Accept both Date objects and ISO strings for date
    date: z.union([z.date(), z.string().datetime()]).optional()
  });
export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({ id: true, userId: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, userId: true })
  .extend({
    // Accept both Date objects and ISO strings for date
    date: z.union([z.date(), z.string().datetime()])
  });

// Social feature schemas
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true })
  .extend({
    startDate: z.union([z.date(), z.string().datetime()]),
    endDate: z.union([z.date(), z.string().datetime()])
  });

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants)
  .omit({ joinDate: true, completedDate: true });

export const insertCommunityRecipeSchema = createInsertSchema(communityRecipes)
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export const insertRecipeRatingSchema = createInsertSchema(recipeRatings)
  .omit({ id: true, userId: true, createdAt: true });

export const insertSocialPostSchema = createInsertSchema(socialPosts)
  .omit({ id: true, userId: true, likesCount: true, commentsCount: true, createdAt: true, updatedAt: true });

export const insertPostCommentSchema = createInsertSchema(postComments)
  .omit({ id: true, userId: true, likesCount: true, createdAt: true, updatedAt: true });

// Export types for use in application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Social feature insert types
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;
export type InsertCommunityRecipe = z.infer<typeof insertCommunityRecipeSchema>;
export type InsertRecipeRating = z.infer<typeof insertRecipeRatingSchema>;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;

export type User = typeof users.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type WaterIntake = typeof waterIntake.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type Product = typeof products.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

// Community and social features types
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type CommunityRecipe = typeof communityRecipes.$inferSelect;
export type RecipeRating = typeof recipeRatings.$inferSelect;
export type RecipeFavorite = typeof recipeFavorites.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type CommentLike = typeof commentLikes.$inferSelect;
export type UserFollower = typeof userFollowers.$inferSelect;

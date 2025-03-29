import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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

export const insertMealSchema = createInsertSchema(meals).omit({ id: true, userId: true });
export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({ id: true, userId: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, userId: true });

// Export types for use in application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type User = typeof users.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type WaterIntake = typeof waterIntake.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type Product = typeof products.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

import { 
  users, type User, type InsertUser,
  meals, type Meal, 
  waterIntake, type WaterIntake,
  mealPlans, type MealPlan,
  products, type Product,
  blogPosts, type BlogPost,
  appointments, type Appointment,
  subscriptions, type Subscription
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Meal methods
  getMealsByUserId(userId: number): Promise<Meal[]>;
  getMealById(id: number): Promise<Meal | undefined>;
  createMeal(meal: Omit<Meal, "id">): Promise<Meal>;
  updateMeal(id: number, meal: Omit<Meal, "id">): Promise<Meal>;
  deleteMeal(id: number): Promise<void>;
  
  // Water intake methods
  getWaterIntakeByUserId(userId: number): Promise<WaterIntake[]>;
  addWaterIntake(waterIntake: Omit<WaterIntake, "id">): Promise<WaterIntake>;
  
  // Meal plan methods
  getAllMealPlans(): Promise<MealPlan[]>;
  getMealPlanById(id: number): Promise<MealPlan | undefined>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  
  // Blog methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  
  // Appointment methods
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment>;
  
  // Subscription methods
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: Omit<Subscription, "id">): Promise<Subscription>;
  isUserPremium(userId: number | undefined): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private mealsStore: Map<number, Meal>;
  private waterIntakeStore: Map<number, WaterIntake>;
  private mealPlansStore: Map<number, MealPlan>;
  private productsStore: Map<number, Product>;
  private blogPostsStore: Map<number, BlogPost>;
  private appointmentsStore: Map<number, Appointment>;
  private subscriptionsStore: Map<number, Subscription>;
  
  sessionStore: session.SessionStore;
  currentId: { [key: string]: number };

  constructor() {
    this.usersStore = new Map();
    this.mealsStore = new Map();
    this.waterIntakeStore = new Map();
    this.mealPlansStore = new Map();
    this.productsStore = new Map();
    this.blogPostsStore = new Map();
    this.appointmentsStore = new Map();
    this.subscriptionsStore = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // One day
    });
    
    this.currentId = {
      users: 1,
      meals: 1,
      waterIntake: 1,
      mealPlans: 1,
      products: 1,
      blogPosts: 1,
      appointments: 1,
      subscriptions: 1
    };
    
    // Init with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id } as User;
    this.usersStore.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = this.usersStore.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.usersStore.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    if (!this.usersStore.has(id)) {
      throw new Error("User not found");
    }
    
    this.usersStore.delete(id);
    
    // Delete all user related data
    this.mealsStore.forEach((meal, mealId) => {
      if (meal.userId === id) {
        this.mealsStore.delete(mealId);
      }
    });
    
    this.waterIntakeStore.forEach((entry, entryId) => {
      if (entry.userId === id) {
        this.waterIntakeStore.delete(entryId);
      }
    });
    
    this.appointmentsStore.forEach((appointment, appointmentId) => {
      if (appointment.userId === id) {
        this.appointmentsStore.delete(appointmentId);
      }
    });
    
    this.subscriptionsStore.forEach((subscription, subscriptionId) => {
      if (subscription.userId === id) {
        this.subscriptionsStore.delete(subscriptionId);
      }
    });
  }

  // Meal methods
  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return Array.from(this.mealsStore.values())
      .filter(meal => meal.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getMealById(id: number): Promise<Meal | undefined> {
    return this.mealsStore.get(id);
  }

  async createMeal(meal: Omit<Meal, "id">): Promise<Meal> {
    const id = this.currentId.meals++;
    const newMeal = { ...meal, id };
    this.mealsStore.set(id, newMeal);
    return newMeal;
  }

  async updateMeal(id: number, mealData: Omit<Meal, "id">): Promise<Meal> {
    if (!this.mealsStore.has(id)) {
      throw new Error("Meal not found");
    }
    
    const updatedMeal = { ...mealData, id };
    this.mealsStore.set(id, updatedMeal);
    return updatedMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    if (!this.mealsStore.has(id)) {
      throw new Error("Meal not found");
    }
    
    this.mealsStore.delete(id);
  }

  // Water intake methods
  async getWaterIntakeByUserId(userId: number): Promise<WaterIntake[]> {
    return Array.from(this.waterIntakeStore.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addWaterIntake(waterIntakeData: Omit<WaterIntake, "id">): Promise<WaterIntake> {
    const id = this.currentId.waterIntake++;
    const newWaterIntake = { ...waterIntakeData, id };
    this.waterIntakeStore.set(id, newWaterIntake);
    return newWaterIntake;
  }

  // Meal plan methods
  async getAllMealPlans(): Promise<MealPlan[]> {
    return Array.from(this.mealPlansStore.values());
  }

  async getMealPlanById(id: number): Promise<MealPlan | undefined> {
    return this.mealPlansStore.get(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.productsStore.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.productsStore.get(id);
  }

  // Blog methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPostsStore.values())
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    return this.blogPostsStore.get(id);
  }

  // Appointment methods
  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointmentsStore.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createAppointment(appointmentData: Omit<Appointment, "id">): Promise<Appointment> {
    const id = this.currentId.appointments++;
    const newAppointment = { ...appointmentData, id };
    this.appointmentsStore.set(id, newAppointment);
    return newAppointment;
  }

  // Subscription methods
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptionsStore.values())
      .find(subscription => subscription.userId === userId && subscription.isActive);
  }

  async createSubscription(subscriptionData: Omit<Subscription, "id">): Promise<Subscription> {
    // Check if user already has an active subscription
    const existingSubscription = await this.getSubscriptionByUserId(subscriptionData.userId);
    
    if (existingSubscription) {
      // Update existing subscription
      const updatedSubscription = { ...existingSubscription, ...subscriptionData };
      this.subscriptionsStore.set(existingSubscription.id, updatedSubscription);
      return updatedSubscription;
    }
    
    // Create new subscription
    const id = this.currentId.subscriptions++;
    const newSubscription = { ...subscriptionData, id };
    this.subscriptionsStore.set(id, newSubscription);
    return newSubscription;
  }

  async isUserPremium(userId: number | undefined): Promise<boolean> {
    if (!userId) return false;
    
    const subscription = await this.getSubscriptionByUserId(userId);
    return subscription?.isActive && subscription?.plan === "premium";
  }

  // Initialize sample data for testing and demo purposes
  private initSampleData() {
    // Sample meal plans
    this.mealPlansStore.set(1, {
      id: 1,
      name: "Balanced Nutrition Plan",
      description: "Perfect macro balance for general health and fitness goals.",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      dietType: "balanced",
      calorieRange: "1,800-2,200 kcal",
      isPremium: false,
      content: {
        days: [
          {
            day: 1,
            meals: [
              {
                type: "breakfast",
                name: "Greek Yogurt with Berries",
                calories: 320,
                protein: 18,
                carbs: 24,
                fats: 12,
                recipe: "Mix 1 cup Greek yogurt with 1/2 cup berries and 1 tbsp honey."
              },
              {
                type: "lunch",
                name: "Grilled Chicken Salad",
                calories: 520,
                protein: 35,
                carbs: 30,
                fats: 20,
                recipe: "Grill 4oz chicken breast and serve over mixed greens with cherry tomatoes, cucumber, and olive oil dressing."
              },
              {
                type: "dinner",
                name: "Baked Salmon with Roasted Vegetables",
                calories: 580,
                protein: 40,
                carbs: 25,
                fats: 30,
                recipe: "Bake 6oz salmon fillet and serve with roasted brussels sprouts and sweet potatoes."
              },
              {
                type: "snack",
                name: "Apple & Almond Butter",
                calories: 180,
                protein: 5,
                carbs: 20,
                fats: 9,
                recipe: "Slice 1 medium apple and serve with 1 tbsp almond butter."
              }
            ]
          }
        ]
      }
    });

    this.mealPlansStore.set(2, {
      id: 2,
      name: "Keto Weight Loss Plan",
      description: "Low-carb, high-fat meals to promote ketosis and fat burning.",
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      dietType: "keto",
      calorieRange: "1,600-1,800 kcal",
      isPremium: false,
      content: {
        days: [
          {
            day: 1,
            meals: [
              {
                type: "breakfast",
                name: "Avocado and Bacon Eggs",
                calories: 450,
                protein: 22,
                carbs: 5,
                fats: 38,
                recipe: "Cook 2 eggs with 2 slices bacon and 1/2 avocado."
              },
              {
                type: "lunch",
                name: "Spinach and Feta Stuffed Chicken",
                calories: 520,
                protein: 40,
                carbs: 6,
                fats: 35,
                recipe: "Stuff chicken breast with spinach and feta, bake until cooked through."
              },
              {
                type: "dinner",
                name: "Zucchini Noodles with Meatballs",
                calories: 480,
                protein: 30,
                carbs: 10,
                fats: 32,
                recipe: "Serve beef meatballs over spiralized zucchini with olive oil and parmesan."
              },
              {
                type: "snack",
                name: "Cheese and Nuts",
                calories: 200,
                protein: 10,
                carbs: 4,
                fats: 16,
                recipe: "1oz cheese with 1/4 cup mixed nuts."
              }
            ]
          }
        ]
      }
    });

    this.mealPlansStore.set(3, {
      id: 3,
      name: "Plant-Based Power Plan",
      description: "Vegetarian meals rich in plant protein and essential nutrients.",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      dietType: "vegetarian",
      calorieRange: "2,000-2,400 kcal",
      isPremium: true,
      content: null
    });

    // Sample blog posts
    this.blogPostsStore.set(1, {
      id: 1,
      title: "The Science Behind Intermittent Fasting",
      content: "Intermittent fasting has gained popularity in recent years as a weight management strategy...",
      imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Nutrition",
      publishDate: new Date("2023-05-10")
    });

    this.blogPostsStore.set(2, {
      id: 2,
      title: "10 Superfoods to Boost Your Immune System",
      content: "Maintaining a strong immune system is essential for overall health and wellbeing...",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Nutrition",
      publishDate: new Date("2023-05-05")
    });

    this.blogPostsStore.set(3, {
      id: 3,
      title: "How to Create Sustainable Eating Habits",
      content: "Creating sustainable eating habits is not just about following a strict diet...",
      imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Lifestyle",
      publishDate: new Date("2023-04-28")
    });

    // Sample products
    this.productsStore.set(1, {
      id: 1,
      name: "NutriBlend Protein Powder",
      description: "Premium plant-based protein powder with 25g protein per serving.",
      price: 3999, // $39.99
      imageUrl: "https://images.unsplash.com/photo-1612549225463-7152e164dbd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Supplements"
    });

    this.productsStore.set(2, {
      id: 2,
      name: "Smart Water Bottle",
      description: "Tracks your water intake and reminds you to stay hydrated throughout the day.",
      price: 2499, // $24.99
      imageUrl: "https://images.unsplash.com/photo-1575377222312-dd1a1facb61a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Accessories"
    });

    this.productsStore.set(3, {
      id: 3,
      name: "Digital Food Scale",
      description: "Precise measurements for portion control and recipe accuracy.",
      price: 1999, // $19.99
      imageUrl: "https://images.unsplash.com/photo-1542979323-a0c47860907c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Kitchen"
    });
    
    this.currentId.mealPlans = 4;
    this.currentId.blogPosts = 4;
    this.currentId.products = 4;
  }
}

export const storage = new MemStorage();

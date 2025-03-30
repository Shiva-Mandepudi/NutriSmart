import { 
  users, type User, type InsertUser,
  meals, type Meal, 
  waterIntake, type WaterIntake,
  mealPlans, type MealPlan,
  products, type Product,
  blogPosts, type BlogPost,
  appointments, type Appointment,
  subscriptions, type Subscription,
  challenges, type Challenge, type InsertChallenge,
  challengeParticipants, type ChallengeParticipant, type InsertChallengeParticipant,
  communityRecipes, type CommunityRecipe, type InsertCommunityRecipe,
  recipeRatings, type RecipeRating, type InsertRecipeRating,
  recipeFavorites, type RecipeFavorite,
  socialPosts, type SocialPost, type InsertSocialPost,
  postComments, type PostComment, type InsertPostComment,
  postLikes, type PostLike,
  commentLikes, type CommentLike,
  userFollowers, type UserFollower
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from './db';
import { pool } from './db';
import connectPg from "connect-pg-simple";
import session from "express-session";
import type { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Create a session store that will create the session table
    this.sessionStore = new PostgresSessionStore({ 
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
      schemaName: 'public',
      pruneSessionInterval: 60 // Clean up session table every 60 seconds
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Meal methods
  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return await db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(meals.date);
  }

  async getMealById(id: number): Promise<Meal | undefined> {
    const [meal] = await db.select().from(meals).where(eq(meals.id, id));
    return meal;
  }

  async createMeal(meal: Omit<Meal, "id">): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async updateMeal(id: number, meal: Omit<Meal, "id">): Promise<Meal> {
    const [updatedMeal] = await db
      .update(meals)
      .set(meal)
      .where(eq(meals.id, id))
      .returning();
    return updatedMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  // Water intake methods
  async getWaterIntakeByUserId(userId: number): Promise<WaterIntake[]> {
    return await db
      .select()
      .from(waterIntake)
      .where(eq(waterIntake.userId, userId))
      .orderBy(waterIntake.date);
  }

  async addWaterIntake(water: Omit<WaterIntake, "id">): Promise<WaterIntake> {
    const [newWaterIntake] = await db.insert(waterIntake).values(water).returning();
    return newWaterIntake;
  }

  // Meal plan methods
  async getAllMealPlans(): Promise<MealPlan[]> {
    return await db.select().from(mealPlans);
  }

  async getMealPlanById(id: number): Promise<MealPlan | undefined> {
    const [mealPlan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return mealPlan;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  // Blog methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(blogPosts.publishDate);
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  // Appointment methods
  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(appointments.date);
  }

  async createAppointment(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  // Subscription methods
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, true)));
    return subscription;
  }

  async createSubscription(subscription: Omit<Subscription, "id">): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async isUserPremium(userId: number | undefined): Promise<boolean> {
    if (!userId) return false;
    
    const subscription = await this.getSubscriptionByUserId(userId);
    return Boolean(subscription?.isActive && subscription?.plan === "premium");
  }
  
  // Social post methods
  async getAllSocialPosts(page: number = 1, limit: number = 10): Promise<SocialPost[]> {
    return db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.isVisible, true))
      .orderBy(socialPosts.createdAt)
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async getUserSocialPosts(userId: number): Promise<SocialPost[]> {
    return db
      .select()
      .from(socialPosts)
      .where(and(
        eq(socialPosts.userId, userId),
        eq(socialPosts.isVisible, true)
      ))
      .orderBy(socialPosts.createdAt);
  }

  async getSocialPostById(id: number): Promise<SocialPost | undefined> {
    const [post] = await db
      .select()
      .from(socialPosts)
      .where(and(
        eq(socialPosts.id, id),
        eq(socialPosts.isVisible, true)
      ));
    return post;
  }

  async createSocialPost(postData: InsertSocialPost & { userId: number }): Promise<SocialPost> {
    const [post] = await db
      .insert(socialPosts)
      .values({
        ...postData,
        likesCount: 0,
        commentsCount: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return post;
  }

  async updateSocialPost(id: number, postData: Partial<SocialPost>): Promise<SocialPost> {
    const [updatedPost] = await db
      .update(socialPosts)
      .set({
        ...postData,
        updatedAt: new Date()
      })
      .where(eq(socialPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteSocialPost(id: number): Promise<void> {
    await db
      .update(socialPosts)
      .set({ isVisible: false })
      .where(eq(socialPosts.id, id));
  }

  // Post comment methods
  async getPostComments(postId: number): Promise<PostComment[]> {
    return db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }
  
  async getCommentsByPostId(postId: number): Promise<PostComment[]> {
    return this.getPostComments(postId);
  }

  async createPostComment(commentData: InsertPostComment & { userId: number }): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values({
        ...commentData,
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Update post comments count
    await db
      .update(socialPosts)
      .set({ 
        commentsCount: db.raw`"comments_count" + 1` 
      })
      .where(eq(socialPosts.id, commentData.postId));

    return comment;
  }

  async updatePostComment(id: number, commentData: Partial<PostComment>): Promise<PostComment> {
    const [updatedComment] = await db
      .update(postComments)
      .set({
        ...commentData,
        updatedAt: new Date()
      })
      .where(eq(postComments.id, id))
      .returning();
    return updatedComment;
  }

  async deletePostComment(id: number): Promise<void> {
    const [comment] = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, id));
      
    if (comment) {
      // Delete the comment
      await db.delete(postComments).where(eq(postComments.id, id));
      
      // Update post comments count
      await db
        .update(socialPosts)
        .set({ 
          commentsCount: db.raw`GREATEST("comments_count" - 1, 0)` 
        })
        .where(eq(socialPosts.id, comment.postId));
    }
  }

  // Post like methods
  async getPostLike(postId: number, userId: number): Promise<PostLike | undefined> {
    const [like] = await db
      .select()
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));
    return like;
  }

  async addPostLike(postId: number, userId: number): Promise<PostLike> {
    const [like] = await db
      .insert(postLikes)
      .values({
        postId,
        userId,
        createdAt: new Date()
      })
      .returning();
      
    // Update post likes count
    await db
      .update(socialPosts)
      .set({ 
        likesCount: db.raw`"likes_count" + 1` 
      })
      .where(eq(socialPosts.id, postId));
      
    return like;
  }

  async removePostLike(postId: number, userId: number): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));
      
    // Update post likes count
    await db
      .update(socialPosts)
      .set({ 
        likesCount: db.raw`GREATEST("likes_count" - 1, 0)` 
      })
      .where(eq(socialPosts.id, postId));
  }
  
  // Post like abstracted methods
  async likePost(postId: number, userId: number): Promise<void> {
    const existing = await this.getPostLike(postId, userId);
    if (!existing) {
      await this.addPostLike(postId, userId);
    }
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    const existing = await this.getPostLike(postId, userId);
    if (existing) {
      await this.removePostLike(postId, userId);
    }
  }

  async isPostLiked(postId: number, userId: number): Promise<boolean> {
    const like = await this.getPostLike(postId, userId);
    return Boolean(like);
  }

  // Comment like methods
  async getCommentLike(commentId: number, userId: number): Promise<CommentLike | undefined> {
    const [like] = await db
      .select()
      .from(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ));
    return like;
  }

  async addCommentLike(commentId: number, userId: number): Promise<CommentLike> {
    const [like] = await db
      .insert(commentLikes)
      .values({
        commentId,
        userId,
        createdAt: new Date()
      })
      .returning();
      
    // Update comment likes count
    await db
      .update(postComments)
      .set({ 
        likesCount: db.raw`"likes_count" + 1` 
      })
      .where(eq(postComments.id, commentId));
      
    return like;
  }

  async removeCommentLike(commentId: number, userId: number): Promise<void> {
    await db
      .delete(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ));
      
    // Update comment likes count
    await db
      .update(postComments)
      .set({ 
        likesCount: db.raw`GREATEST("likes_count" - 1, 0)` 
      })
      .where(eq(postComments.id, commentId));
  }
  
  // Comment like abstracted methods
  async likeComment(commentId: number, userId: number): Promise<void> {
    const existing = await this.getCommentLike(commentId, userId);
    if (!existing) {
      await this.addCommentLike(commentId, userId);
    }
  }

  async unlikeComment(commentId: number, userId: number): Promise<void> {
    const existing = await this.getCommentLike(commentId, userId);
    if (existing) {
      await this.removeCommentLike(commentId, userId);
    }
  }

  async isCommentLiked(commentId: number, userId: number): Promise<boolean> {
    const like = await this.getCommentLike(commentId, userId);
    return Boolean(like);
  }
  
  // Challenge methods
  async getAllChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges);
  }
  
  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return db
      .select()
      .from(challenges)
      .where(and(
        eq(challenges.isActive, true),
        db.sql`${challenges.startDate} <= ${now}`,
        db.sql`${challenges.endDate} >= ${now}`
      ));
  }
  
  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id));
    return challenge;
  }
  
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db
      .insert(challenges)
      .values({
        ...challenge,
        createdAt: new Date()
      })
      .returning();
    return newChallenge;
  }
  
  async updateChallenge(id: number, challengeData: Partial<Challenge>): Promise<Challenge> {
    const [updatedChallenge] = await db
      .update(challenges)
      .set(challengeData)
      .where(eq(challenges.id, id))
      .returning();
    return updatedChallenge;
  }
  
  // Challenge participant methods
  async getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]> {
    return db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challengeId));
  }
  
  async getChallengeParticipant(challengeId: number, userId: number): Promise<ChallengeParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ));
    return participant;
  }
  
  async joinChallenge(data: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const [participant] = await db
      .insert(challengeParticipants)
      .values({
        ...data,
        joinDate: new Date()
      })
      .returning();
    return participant;
  }
  
  async addChallengeParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    return this.joinChallenge(participant);
  }
  
  async updateChallengeProgress(challengeId: number, userId: number, progress: number): Promise<ChallengeParticipant> {
    const [updatedParticipant] = await db
      .update(challengeParticipants)
      .set({ progress })
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ))
      .returning();
    return updatedParticipant;
  }
  
  async completeChallenge(challengeId: number, userId: number): Promise<ChallengeParticipant> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId));
      
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    const [completedParticipant] = await db
      .update(challengeParticipants)
      .set({ 
        progress: challenge.goalValue,
        completed: true,
        completedDate: new Date()
      })
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ))
      .returning();
      
    return completedParticipant;
  }
  
  async getUserChallenges(userId: number): Promise<{challenge: Challenge, participant: ChallengeParticipant}[]> {
    const participants = await db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.userId, userId));
      
    const result: {challenge: Challenge, participant: ChallengeParticipant}[] = [];
    
    for (const participant of participants) {
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, participant.challengeId));
        
      if (challenge) {
        result.push({
          challenge,
          participant
        });
      }
    }
    
    return result;
  }
  
  // Community Recipe methods
  async getAllCommunityRecipes(page: number = 1, limit: number = 10): Promise<CommunityRecipe[]> {
    return db
      .select()
      .from(communityRecipes)
      .where(eq(communityRecipes.isPublic, true))
      .orderBy(communityRecipes.createdAt)
      .limit(limit)
      .offset((page - 1) * limit);
  }
  
  async getCommunityRecipeById(id: number): Promise<CommunityRecipe | undefined> {
    const [recipe] = await db
      .select()
      .from(communityRecipes)
      .where(eq(communityRecipes.id, id));
    return recipe;
  }
  
  async getUserRecipes(userId: number): Promise<CommunityRecipe[]> {
    return db
      .select()
      .from(communityRecipes)
      .where(eq(communityRecipes.userId, userId));
  }
  
  async createCommunityRecipe(recipe: InsertCommunityRecipe & { userId: number }): Promise<CommunityRecipe> {
    const now = new Date();
    const [newRecipe] = await db
      .insert(communityRecipes)
      .values({
        ...recipe,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newRecipe;
  }
  
  async updateCommunityRecipe(id: number, recipe: Partial<CommunityRecipe>): Promise<CommunityRecipe> {
    const [updatedRecipe] = await db
      .update(communityRecipes)
      .set({
        ...recipe,
        updatedAt: new Date()
      })
      .where(eq(communityRecipes.id, id))
      .returning();
    return updatedRecipe;
  }
  
  async deleteCommunityRecipe(id: number): Promise<void> {
    await db.delete(communityRecipes).where(eq(communityRecipes.id, id));
  }
  
  // Recipe rating methods
  async getRecipeRatings(recipeId: number): Promise<RecipeRating[]> {
    return db
      .select()
      .from(recipeRatings)
      .where(eq(recipeRatings.recipeId, recipeId));
  }
  
  async getRecipeRating(recipeId: number, userId: number): Promise<RecipeRating | undefined> {
    const [rating] = await db
      .select()
      .from(recipeRatings)
      .where(and(
        eq(recipeRatings.recipeId, recipeId),
        eq(recipeRatings.userId, userId)
      ));
    return rating;
  }
  
  async getUserRecipeRating(recipeId: number, userId: number): Promise<RecipeRating | undefined> {
    return this.getRecipeRating(recipeId, userId);
  }
  
  async createRecipeRating(rating: InsertRecipeRating & { userId: number }): Promise<RecipeRating> {
    const [newRating] = await db
      .insert(recipeRatings)
      .values({
        ...rating,
        createdAt: new Date()
      })
      .returning();
    return newRating;
  }
  
  async updateRecipeRating(id: number, ratingData: Partial<RecipeRating>): Promise<RecipeRating> {
    const [updatedRating] = await db
      .update(recipeRatings)
      .set(ratingData)
      .where(eq(recipeRatings.id, id))
      .returning();
    return updatedRating;
  }
  
  async rateRecipe(rating: InsertRecipeRating & { userId: number }): Promise<RecipeRating> {
    const existingRating = await this.getRecipeRating(rating.recipeId, rating.userId);
    
    if (existingRating) {
      return this.updateRecipeRating(existingRating.id, {
        rating: rating.rating,
        comment: rating.comment
      });
    }
    
    return this.createRecipeRating(rating);
  }
  
  // Recipe favorites methods
  async getRecipeFavorite(recipeId: number, userId: number): Promise<RecipeFavorite | undefined> {
    const [favorite] = await db
      .select()
      .from(recipeFavorites)
      .where(and(
        eq(recipeFavorites.recipeId, recipeId),
        eq(recipeFavorites.userId, userId)
      ));
    return favorite;
  }
  
  async addRecipeFavorite(recipeId: number, userId: number): Promise<RecipeFavorite> {
    const [favorite] = await db
      .insert(recipeFavorites)
      .values({
        recipeId,
        userId,
        addedAt: new Date()
      })
      .returning();
    return favorite;
  }
  
  async removeRecipeFavorite(recipeId: number, userId: number): Promise<void> {
    await db
      .delete(recipeFavorites)
      .where(and(
        eq(recipeFavorites.recipeId, recipeId),
        eq(recipeFavorites.userId, userId)
      ));
  }
  
  async getUserFavoriteRecipes(userId: number): Promise<CommunityRecipe[]> {
    const favorites = await db
      .select()
      .from(recipeFavorites)
      .where(eq(recipeFavorites.userId, userId));
      
    if (favorites.length === 0) {
      return [];
    }
    
    const recipeIds = favorites.map(f => f.recipeId);
    
    return db
      .select()
      .from(communityRecipes)
      .where(and(
        db.inArray(communityRecipes.id, recipeIds),
        eq(communityRecipes.isPublic, true)
      ));
  }
  
  async addRecipeToFavorites(recipeId: number, userId: number): Promise<void> {
    await this.addRecipeFavorite(recipeId, userId);
  }
  
  async removeRecipeFromFavorites(recipeId: number, userId: number): Promise<void> {
    await this.removeRecipeFavorite(recipeId, userId);
  }
  
  async isRecipeFavorited(recipeId: number, userId: number): Promise<boolean> {
    const favorite = await this.getRecipeFavorite(recipeId, userId);
    return Boolean(favorite);
  }
  
  // User follower methods
  async getUserFollower(targetUserId: number, followerUserId: number): Promise<UserFollower | undefined> {
    const [follower] = await db
      .select()
      .from(userFollowers)
      .where(and(
        eq(userFollowers.followingId, targetUserId),
        eq(userFollowers.followerId, followerUserId)
      ));
    return follower;
  }
  
  async addUserFollower(targetUserId: number, followerUserId: number): Promise<UserFollower> {
    const [follow] = await db
      .insert(userFollowers)
      .values({
        followerId: followerUserId,
        followingId: targetUserId,
        createdAt: new Date()
      })
      .returning();
    return follow;
  }
  
  async removeUserFollower(targetUserId: number, followerUserId: number): Promise<void> {
    await db
      .delete(userFollowers)
      .where(and(
        eq(userFollowers.followingId, targetUserId),
        eq(userFollowers.followerId, followerUserId)
      ));
  }
  
  async getUserFollowers(userId: number): Promise<User[]> {
    const followers = await db
      .select({
        followerId: userFollowers.followerId
      })
      .from(userFollowers)
      .where(eq(userFollowers.followingId, userId));
      
    const followerIds = followers.map(f => f.followerId);
    
    if (followerIds.length === 0) {
      return [];
    }
    
    return db
      .select()
      .from(users)
      .where(db.inArray(users.id, followerIds));
  }
  
  async getUserFollowing(userId: number): Promise<User[]> {
    const following = await db
      .select({
        followingId: userFollowers.followingId
      })
      .from(userFollowers)
      .where(eq(userFollowers.followerId, userId));
      
    const followingIds = following.map(f => f.followingId);
    
    if (followingIds.length === 0) {
      return [];
    }
    
    return db
      .select()
      .from(users)
      .where(db.inArray(users.id, followingIds));
  }
  
  async followUser(followerId: number, followingId: number): Promise<void> {
    await this.addUserFollower(followingId, followerId);
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await this.removeUserFollower(followingId, followerId);
  }
  
  async isUserFollowing(followerId: number, followingId: number): Promise<boolean> {
    const following = await this.getUserFollower(followingId, followerId);
    return Boolean(following);
  }
}
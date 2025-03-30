import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Challenge, CommunityRecipe, SocialPost } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, MessageSquare, ThumbsUp, Users, Award, Calendar, Target } from "lucide-react";
export default function CommunityPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  
  // Fetch social posts for the feed tab
  const { 
    data: posts, 
    isLoading: isLoadingPosts 
  } = useQuery<SocialPost[]>({ 
    queryKey: ["/api/social/posts"], 
    enabled: activeTab === "feed"
  });

  // Fetch challenges for the challenges tab
  const { 
    data: challenges, 
    isLoading: isLoadingChallenges 
  } = useQuery<Challenge[]>({ 
    queryKey: ["/api/social/challenges"], 
    enabled: activeTab === "challenges"
  });

  // Fetch community recipes for the recipes tab
  const { 
    data: recipes, 
    isLoading: isLoadingRecipes 
  } = useQuery<CommunityRecipe[]>({ 
    queryKey: ["/api/social/recipes"], 
    enabled: activeTab === "recipes"
  });

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Community</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => toast({ title: "Coming soon", description: "This feature is coming soon!" })}>
              <Users className="mr-2 h-4 w-4" />
              Find Friends
            </Button>
            <Button onClick={() => toast({ title: "Coming soon", description: "This feature is coming soon!" })}>
              Create Post
            </Button>
          </div>
        </div>

        <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Social Feed</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="recipes">Community Recipes</TabsTrigger>
          </TabsList>
          
          {/* Social Feed Tab */}
          <TabsContent value="feed">
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !posts || posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found. Be the first to share something!</p>
                <Button className="mt-4" onClick={() => toast({ title: "Coming soon", description: "This feature is coming soon!" })}>
                  Create Post
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <SocialPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Challenges Tab */}
          <TabsContent value="challenges">
            {isLoadingChallenges ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !challenges || challenges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active challenges at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Community Recipes Tab */}
          <TabsContent value="recipes">
            {isLoadingRecipes ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !recipes || recipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No community recipes yet. Share your favorite recipe!</p>
                <Button className="mt-4" onClick={() => toast({ title: "Coming soon", description: "This feature is coming soon!" })}>
                  Share Recipe
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}

// Social post card component
function SocialPostCard({ post }: { post: SocialPost }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleLike = () => {
    toast({
      title: "Coming soon",
      description: "This feature is coming soon!"
    });
  };

  const handleComment = () => {
    toast({
      title: "Coming soon",
      description: "This feature is coming soon!"
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">User {post.userId}</CardTitle>
            <CardDescription>{format(new Date(post.createdAt), 'MMM d, yyyy')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
        {post.imageUrl && (
          <div className="mt-4 rounded-md overflow-hidden">
            <img src={post.imageUrl} alt="Post image" className="w-full h-auto" />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center">
            <ThumbsUp className="mr-1 h-4 w-4" /> 
            <span>{post.likesCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleComment} className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" /> 
            <span>{post.commentsCount || 0}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Challenge card component
function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { toast } = useToast();
  
  const handleJoinChallenge = () => {
    toast({
      title: "Coming soon",
      description: "This feature is coming soon!"
    });
  };
  
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = challenge.isActive && startDate <= new Date() && endDate >= new Date();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          {isActive && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              Active
            </span>
          )}
        </div>
        <CardDescription className="flex items-center mt-1">
          <Calendar className="h-3 w-3 mr-1" /> 
          {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
        <div className="flex items-center mt-3 text-sm">
          <Target className="h-3 w-3 mr-1" /> 
          <span className="font-medium">{challenge.goal}</span>
          <span className="ml-1 text-muted-foreground">({challenge.goalValue} {challenge.goalType})</span>
        </div>
        {challenge.rewards && (
          <div className="flex items-center mt-1 text-sm">
            <Award className="h-3 w-3 mr-1" /> 
            <span>{challenge.rewards}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={handleJoinChallenge} variant="outline" className="w-full">
          Join Challenge
        </Button>
      </CardFooter>
    </Card>
  );
}

// Recipe card component
function RecipeCard({ recipe }: { recipe: CommunityRecipe }) {
  const { toast } = useToast();
  
  const handleViewRecipe = () => {
    toast({
      title: "Coming soon",
      description: "This feature is coming soon!"
    });
  };

  return (
    <Card className="overflow-hidden">
      {recipe.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{recipe.title}</CardTitle>
        <CardDescription>by User {recipe.userId}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        <div className="flex justify-between mt-3 text-sm">
          <span>
            <span className="font-medium">{recipe.prepTime + recipe.cookTime}</span> min
          </span>
          <span>
            <span className="font-medium">{recipe.servings}</span> servings
          </span>
          {recipe.calories && (
            <span>
              <span className="font-medium">{recipe.calories}</span> cal
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={handleViewRecipe} variant="outline" className="w-full">
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
}
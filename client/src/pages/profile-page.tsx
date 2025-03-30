import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserIcon, Lock, LogOut, Save, Upload, Trash2 } from "lucide-react";
import { DietPreferencesForm } from "@/components/forms/diet-preferences-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Form validation schemas
const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  profilePicture: z.string().optional(),
  calorieGoal: z.coerce.number().int().positive("Calorie goal must be positive").optional(),
  weightKg: z.coerce.number().positive("Weight must be positive").optional(),
  heightCm: z.coerce.number().positive("Height must be positive").optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, updateProfileMutation, deleteAccountMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      profilePicture: user?.profilePicture || "",
      calorieGoal: user?.calorieGoal || 2000,
      weightKg: user?.weightKg || undefined,
      heightCm: user?.heightCm || undefined,
    },
  });
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };
  
  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    // This would normally hit a password change API endpoint
    console.log("Password change:", values);
    
    // Reset the form after submission
    passwordForm.reset();
  };
  
  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Skeleton className="h-[600px] w-full max-w-3xl rounded-xl" />
        </main>
        <MobileNav />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      
      
      <main className="flex-grow">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-md">
              {user.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user.username} />
              ) : (
                <AvatarFallback className="bg-primary-100 dark:bg-primary-800 text-4xl">
                  {user.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>
              
              <SocialCounts userId={user.id} />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                              <div className="flex gap-3">
                                <Input placeholder="https://example.com/profile.jpg" {...field} />
                                <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="calorieGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Calorie Goal</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Calories per day
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="weightKg"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription className="text-xs">
                                In kilograms
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="heightCm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription className="text-xs">
                                In centimeters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="reset" onClick={() => profileForm.reset()}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="gap-2"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Dietary Preferences</CardTitle>
                  <CardDescription>
                    Set your dietary preferences for personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DietPreferencesForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                      <CardContent className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                At least 8 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" className="ml-auto">
                          Update Password
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>
                      These actions are permanent and cannot be undone
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteAccountMutation.isPending}
                          >
                            {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}

// Social counts component
function SocialCounts({ userId }: { userId: number }) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  // Fetch followers
  const { 
    data: followers,
    isLoading: isLoadingFollowers 
  } = useQuery<User[]>({ 
    queryKey: [`/api/social/users/${userId}/followers`], 
    enabled: true
  });
  
  // Fetch following
  const { 
    data: following,
    isLoading: isLoadingFollowing 
  } = useQuery<User[]>({ 
    queryKey: [`/api/social/users/${userId}/following`], 
    enabled: true
  });
  
  const followersCount = followers?.length || 0;
  const followingCount = following?.length || 0;
  
  return (
    <div className="flex space-x-4">
      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogTrigger asChild>
          <Button variant="link" className="h-auto p-0">
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-secondary">
              <span className="font-bold mr-1">{followersCount}</span> Followers
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
            <DialogDescription>
              People who follow you
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto pr-2 py-4">
            {isLoadingFollowers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !followers || followers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any followers yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followers.map((follower) => (
                  <Card key={follower.id} className="flex items-center p-4">
                    <Avatar className="h-10 w-10 mr-4">
                      {follower.profilePicture ? (
                        <AvatarImage src={follower.profilePicture} alt={follower.username} />
                      ) : (
                        <AvatarFallback>{follower.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {follower.firstName && follower.lastName 
                          ? `${follower.firstName} ${follower.lastName}`
                          : follower.username}
                      </p>
                      <p className="text-sm text-muted-foreground">@{follower.username}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogTrigger asChild>
          <Button variant="link" className="h-auto p-0">
            <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-secondary">
              <span className="font-bold mr-1">{followingCount}</span> Following
            </Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>
              People you follow
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto pr-2 py-4">
            {isLoadingFollowing ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !following || following.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You're not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {following.map((followedUser) => (
                  <Card key={followedUser.id} className="flex items-center p-4">
                    <Avatar className="h-10 w-10 mr-4">
                      {followedUser.profilePicture ? (
                        <AvatarImage src={followedUser.profilePicture} alt={followedUser.username} />
                      ) : (
                        <AvatarFallback>{followedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {followedUser.firstName && followedUser.lastName 
                          ? `${followedUser.firstName} ${followedUser.lastName}`
                          : followedUser.username}
                      </p>
                      <p className="text-sm text-muted-foreground">@{followedUser.username}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

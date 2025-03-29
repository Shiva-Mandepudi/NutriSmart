import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginUserSchema, InsertUser, LoginUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useWindowSize } from "@/hooks/use-window-size";
import { z } from "zod";
import { Redirect } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ThreeDModel } from "@/components/ui/3d-model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Brain, Sparkles, Users } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Extended schemas for client-side validation
  const extendedLoginSchema = loginUserSchema.extend({
    rememberMe: z.boolean().default(false).optional(),
  });
  
  // Create a register schema that includes all fields from insertUserSchema plus agreeTos
  const extendedRegisterSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profilePicture: z.string().optional(),
    calorieGoal: z.number().optional().default(2000),
    weightKg: z.number().optional(),
    heightCm: z.number().optional(),
    dietaryPreferences: z.any().optional(),
    agreeTos: z.boolean().refine(val => val, {
      message: "You must agree to the terms of service",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof extendedLoginSchema>>({
    resolver: zodResolver(extendedLoginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof extendedRegisterSchema>>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTos: false,
    },
  });
  
  // Handle login form submission
  function onLoginSubmit(values: z.infer<typeof extendedLoginSchema>) {
    const { rememberMe, ...loginData } = values;
    loginMutation.mutate(loginData);
  }
  
  // Handle register form submission
  function onRegisterSubmit(values: z.infer<typeof extendedRegisterSchema>) {
    // Extract only the fields needed for registration (matching InsertUser type)
    const registerData = {
      username: values.username,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      firstName: values.firstName,
      lastName: values.lastName,
      profilePicture: values.profilePicture,
      calorieGoal: values.calorieGoal,
      weightKg: values.weightKg,
      heightCm: values.heightCm,
      dietaryPreferences: values.dietaryPreferences
    };
    
    registerMutation.mutate(registerData);
  }
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Image & Branding */}
      <div className="w-full md:w-1/2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-8 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Use simple gradient background instead of 3D model for improved performance/reliability */}
            <div className="w-full h-full bg-gradient-radial from-primary-300/20 to-transparent"></div>
          </div>
        </div>
        
        <div className="flex items-center mb-12 z-10">
          <Leaf className="h-6 w-6" />
          <h1 className="font-accent font-bold text-xl ml-2">NutriTech<span className="text-white">AI</span></h1>
        </div>
        
        <div className="flex-grow flex flex-col justify-center z-10 max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Nutrition with AI</h2>
          <p className="text-white/80 mb-8">Personalized meal plans, intelligent tracking, and data-driven insights to help you reach your health and fitness goals.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="font-medium">AI-Powered</span>
              </div>
              <p className="text-sm text-white/70">Advanced algorithms create plans tailored to your body and goals</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-medium">Personalized</span>
              </div>
              <p className="text-sm text-white/70">Customized nutrition based on your preferences and dietary needs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-300 flex items-center justify-center text-xs font-bold">JD</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-300 flex items-center justify-center text-xs font-bold">SK</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-300 flex items-center justify-center text-xs font-bold">AM</div>
            </div>
            <p className="text-sm text-white/80">Join <span className="font-bold">10,000+</span> users transforming their nutrition journey</p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Forms */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to continue your nutrition journey</p>
              </div>
              
              <div className="flex gap-4 mb-6">
                <Button variant="outline" className="flex-1 gap-2" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </Button>
                <Button variant="outline" className="flex-1 gap-2" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.57 8.831c-.199-.0077-1.857-.0701-3.73.9657c-.786-1.599-1.986-2.784-3.526-2.782c-.697.0005-1.38.1738-2.001.4955c-.621.3218-1.166.7852-1.581 1.353c-1.066 1.455-.8755 3.536-.7234 4.29c-1.162.0512-5.329.3045-5.329 5.082c0 .64.0701 1.534.2078 2.458c.1277.824.3144 1.676.5879 2.443c.2736.766.6443 1.398 1.126 1.822c.4816.424 1.069.64 1.774.64c.3455 0 .691-.05 1.037-.1c.3455-.05.691-.1247.9968-.1994c.2457-.0747.4617-.1494.6479-.1993c.1862-.0498.3228-.0747.403-.1c.1756-.0249.4037-.0797.6914-.1346c.2877-.0548.6251-.1097 1.012-.1645c.3871-.0548.7943-.1097 1.241-.1346c.447-.0249.9338-.05 1.46-.05s1.013.025 1.46.05c.447.025.854.0798 1.241.1346c.387.0548.725.1097 1.012.1645c.288.0549.516.1097.691.1346c.08.0253.217.0502.403.1c.186.05.402.1246.648.1993c.306.0747.651.1495.997.1994c.346.05.691.1 1.037.1c.705 0 1.293-.2159 1.774-.64c.482-.4239.852-1.056 1.126-1.822c.274-.7665.46-1.618.588-2.443c.138-.9243.208-1.818.208-2.458c0-4.778-4.167-5.031-5.329-5.082c.104-.5116.227-1.18.227-1.897c0-.7693-.095-1.554-.276-2.108c.04-.0052 1.599-.2351 2.545-1.083c.191-.1718.337-.3934.425-.6415c.087-.2482.094-.515.019-.7674c-.075-.2524-.227-.4723-.433-.628c-.206-.1557-.456-.2345-.711-.2265zm-.4 2.324c-.6954.536-1.791.8066-2.753.8809c-.315.0243-.571.2651-.636.5758c-.062.2958.084.592.359.7306c.41.206.706.8976.706 1.794c0 .9222-.339 1.937-.339 1.937c-.073.2634.001.5451.193.7399c.192.1947.476.2614.733.1753c.073-.0245 4.066-.2845 4.066 3.774c0 .54-.0599 1.334-.1831 2.153c-.1232.719-.2908 1.414-.4917 1.957c-.1675.451-.3344.764-.4817.94c-.1473.177-.1985.177-.2199.177c-.1511 0-.3315-.0249-.5427-.0747c-.2111-.0498-.4519-.1097-.7223-.1695c-.2704-.0598-.566-.1196-.8913-.1794c-.3254-.0598-.6756-.1196-1.066-.1645c-.3905-.0449-.8107-.0898-1.271-.1097c-.4602-.0199-.9501-.0299-1.47-.0299s-1.01.01-1.47.0299c-.4603.0199-.8805.0648-1.271.1097c-.3904.0449-.7407.1047-1.066.1645c-.3253.0598-.621.1196-.8913.1794c-.2704.0598-.5113.1197-.7224.1695c-.2111.0498-.3915.0747-.5426.0747c-.0214 0-.0726 0-.2199-.1768c-.1473-.1768-.3142-.4889-.4817-.9399c-.201-.5422-.3686-1.237-.4917-1.957c-.1233-.8193-.1832-1.613-.1832-2.153c0-4.058 3.993-3.798 4.066-3.774c.2566.086.5407.0193.7326-.1753c.192-.1948.266-.4765.193-.7399c0 0-.3388-1.015-.3388-1.937c0-.8966.296-1.588.7058-1.794c.275-.1387.421-.4349.359-.7306c-.064-.3107-.32-.5515-.636-.5758c-.9618-.0743-2.058-.3449-2.753-.8809c-.1354-.1045-.2244-.1591-.2691-.1837c.1195.3821.2229.8985.2229 1.522c0 .5964-.0999 1.213-.1879 1.71c-.0551.3117.103.6223.383.7508c.28.1285.611.0468.8-.1967c0 0 .0749-.0968.168-.2334c-.0499.5616-.1438 1.247-.1438 1.732c0 3.206 2.866 4.159 5.064 4.464c.335.0465.591.3285.606.664c.015.3354-.217.6323-.546.7032c-1.522.3275-6.424 1.605-6.424 6.933c0 .6158.0701 1.48.2028 2.334c.1326.854.325 1.726.6084 2.472c.2834.746.658 1.377 1.158 1.823c.4999.446 1.116.67 1.842.67c.3554 0 .7159-.05 1.076-.1c.3604-.05.7208-.1247 1.036-.1994c.3158-.0747.5915-.1494.8176-.1993c.2261-.0499.4026-.0747.5093-.1c.1602-.0249.3653-.0797.6201-.1346c.2548-.0548.5494-.1097.8836-.1645c.3343-.0548.6939-.1097 1.089-.1346c.395-.0249.8246-.05 1.29-.05s.895.025 1.29.05c.395.025.755.0798 1.089.1346c.334.0548.629.1097.884.1645c.255.0549.46.1097.62.1346c.107.0253.283.0502.509.1c.226.05.502.1246.818.1993c.315.0747.675.1495 1.036.1994c.36.05.721.1 1.076.1c.726 0 1.342-.2239 1.842-.67c.5-.4458.874-1.077 1.158-1.823c.283-.7459.476-1.618.608-2.472c.133-.8542.203-1.718.203-2.334c0-5.328-4.902-6.605-6.424-6.933c-.329-.0708-.561-.3677-.546-.7031c.015-.3356.271-.6175.606-.6641c2.198-.3051 5.064-1.258 5.064-4.464c0-.4847-.094-1.171-.144-1.732c.093.1367.168.2334.168.2334c.189.2434.52.3252.8.1967c.28-.1285.438-.4391.383-.7508c-.088-.497-.188-1.114-.188-1.71c0-.6238.103-1.14.223-1.522c-.045.0246-.134.0792-.269.1837z"/>
                  </svg>
                  <span>GitHub</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">or continue with</span>
                <div className="h-px flex-1 bg-gray-300 dark:bg-gray-700"></div>
              </div>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Password</FormLabel>
                          <a 
                            href="#" 
                            className="text-sm text-primary-500 hover:text-primary-600"
                            onClick={(e) => {
                              e.preventDefault();
                              // In a real app, this would navigate to a forgot password page
                            }}
                          >
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                Don't have an account? 
                <button 
                  onClick={() => setActiveTab("register")}
                  className="text-primary-500 hover:text-primary-600 font-medium ml-1"
                >
                  Create account
                </button>
              </p>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Create an Account</h2>
                <p className="text-gray-600 dark:text-gray-400">Start your journey to better nutrition</p>
              </div>
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="agreeTos"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          I agree to the <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a> and <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                Already have an account? 
                <button 
                  onClick={() => setActiveTab("login")}
                  className="text-primary-500 hover:text-primary-600 font-medium ml-1"
                >
                  Sign in
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

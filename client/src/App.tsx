import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { ReactNode } from "react";

// Pages
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import MealPlansPage from "@/pages/meal-plans-page";
import RecipesPage from "@/pages/recipes-page";
import ProfilePage from "@/pages/profile-page";
import BlogPage from "@/pages/blog-page";
import ShopPage from "@/pages/shop-page";
import CalculatorsPage from "@/pages/calculators-page";
import AppointmentsPage from "@/pages/appointments-page";
import ChatPage from "@/pages/chat-page";
import CommunityPage from "@/pages/community-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/">
        <ProtectedRoute 
          path="/" 
          component={() => (
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/meal-plans">
        <ProtectedRoute 
          path="/meal-plans" 
          component={() => (
            <AppLayout>
              <MealPlansPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/recipes">
        <ProtectedRoute 
          path="/recipes" 
          component={() => (
            <AppLayout>
              <RecipesPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute 
          path="/profile" 
          component={() => (
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/blog">
        <ProtectedRoute 
          path="/blog" 
          component={() => (
            <AppLayout>
              <BlogPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/shop">
        <ProtectedRoute 
          path="/shop" 
          component={() => (
            <AppLayout>
              <ShopPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/calculators">
        <ProtectedRoute 
          path="/calculators" 
          component={() => (
            <AppLayout>
              <CalculatorsPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/appointments">
        <ProtectedRoute 
          path="/appointments" 
          component={() => (
            <AppLayout>
              <AppointmentsPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/chat">
        <ProtectedRoute 
          path="/chat" 
          component={() => (
            <AppLayout>
              <ChatPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route path="/community">
        <ProtectedRoute 
          path="/community" 
          component={() => (
            <AppLayout>
              <CommunityPage />
            </AppLayout>
          )} 
        />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

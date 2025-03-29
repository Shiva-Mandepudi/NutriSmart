import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/meal-plans" component={MealPlansPage} />
      <ProtectedRoute path="/recipes" component={RecipesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/blog" component={BlogPage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/calculators" component={CalculatorsPage} />
      <ProtectedRoute path="/appointments" component={AppointmentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

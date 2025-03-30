import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Calculator,
  Clock,
  ShoppingBag,
  User,
  Leaf,
  PlusCircle
} from "lucide-react";

// Navigation items with their icons
const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Meal Plans",
    href: "/meal-plans",
    icon: CalendarDays,
  },
  {
    name: "Recipes",
    href: "/recipes",
    icon: BookOpen,
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Calculators",
    href: "/calculators",
    icon: Calculator,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: Clock,
  },
  {
    name: "Shop",
    href: "/shop",
    icon: ShoppingBag,
  },
  {
    name: "Blog",
    href: "/blog",
    icon: BookOpen,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function SidebarNav() {
  const [location] = useLocation();

  return (
    <div className="fixed top-0 left-0 bottom-0 z-40 hidden md:block border-r border-gray-200 dark:border-gray-800 pt-16 w-64 bg-white dark:bg-gray-900">
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center">
            <Leaf className="text-primary-500 h-6 w-6 mr-2" />
            <h1 className="font-bold text-xl">
              NutriTech<span className="text-primary-500">AI</span>
            </h1>
          </Link>
        </div>
        
        <Link href="/add-meal">
          <Button className="w-full mb-6 gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Meal
          </Button>
        </Link>
        
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = 
              item.href === "/" 
                ? location === "/"
                : location.startsWith(item.href);
                
            return (
              <Link key={item.name} href={item.href} 
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary-500 dark:text-primary-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
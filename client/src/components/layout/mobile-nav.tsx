import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Plus, 
  BookOpen, 
  User, 
  MessageSquare, 
  Calculator, 
  Clock,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const mainNavItems = [
    {
      href: "/",
      icon: <Home className="w-6 h-6" />,
      label: "Home",
      isActive: location === "/",
    },
    {
      href: "/meal-plans",
      icon: <Calendar className="w-6 h-6" />,
      label: "Plans",
      isActive: location.startsWith("/meal-plans"),
    },
    {
      href: "/chat",
      icon: <MessageSquare className="w-6 h-6" />,
      label: "Chat",
      isActive: location.startsWith("/chat"),
    },
    {
      href: "/recipes",
      icon: <BookOpen className="w-6 h-6" />,
      label: "Recipes",
      isActive: location.startsWith("/recipes"),
    },
    {
      href: "/profile",
      icon: <User className="w-6 h-6" />,
      label: "Profile",
      isActive: location.startsWith("/profile"),
    },
  ];
  
  const menuItems = [
    {
      href: "/",
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      isActive: location === "/",
    },
    {
      href: "/meal-plans",
      icon: <Calendar className="w-5 h-5" />,
      label: "Meal Plans",
      isActive: location.startsWith("/meal-plans"),
    },
    {
      href: "/recipes",
      icon: <BookOpen className="w-5 h-5" />,
      label: "Recipes",
      isActive: location.startsWith("/recipes"),
    },
    {
      href: "/chat",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "AI Chat",
      isActive: location.startsWith("/chat"),
    },
    {
      href: "/calculators",
      icon: <Calculator className="w-5 h-5" />,
      label: "Calculators",
      isActive: location.startsWith("/calculators"),
    },
    {
      href: "/appointments",
      icon: <Clock className="w-5 h-5" />,
      label: "Appointments",
      isActive: location.startsWith("/appointments"),
    },
    {
      href: "/blog",
      icon: <BookOpen className="w-5 h-5" />,
      label: "Blog",
      isActive: location.startsWith("/blog"),
    },
    {
      href: "/profile",
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      isActive: location.startsWith("/profile"),
    },
  ];
  
  return (
    <>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild className="md:hidden">
          <button className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400">
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <div className="py-4">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary-500 text-white">
                <span className="text-xl font-bold">N</span>
              </div>
              <span className="ml-3 text-xl font-bold">
                NutriTech<span className="text-primary-500">AI</span>
              </span>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link href={item.href} className="block w-full">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-3 py-2",
                        item.isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <span className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </span>
                    </Button>
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
      
      <nav className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 md:hidden">
        <div className="flex justify-around items-center">
          <div className="sheet-trigger-container">
            {/* Sheet trigger is used here by the Sheet component */}
          </div>
          
          {mainNavItems.slice(0, 2).map((item) => (
            <NavItem 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              isActive={item.isActive} 
            />
          ))}
          
          <AddMealButton />
          
          {mainNavItems.slice(2, 4).map((item) => (
            <NavItem 
              key={item.href}
              href={item.href} 
              icon={item.icon} 
              label={item.label} 
              isActive={item.isActive} 
            />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  isActive 
}: { 
  href: string, 
  icon: React.ReactNode, 
  label: string, 
  isActive: boolean 
}) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center p-2",
      isActive ? "text-primary-500" : "text-gray-500 dark:text-gray-400"
    )}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

function AddMealButton() {
  return (
    <div className="flex flex-col items-center p-2">
      <Link href="/add-meal" className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center -mt-5 shadow-lg">
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}

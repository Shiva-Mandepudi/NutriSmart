import { Link, useLocation } from "wouter";
import { Home, Calendar, Plus, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 md:hidden">
      <div className="flex justify-around items-center">
        <NavItem 
          href="/" 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
          isActive={location === "/"} 
        />
        
        <NavItem 
          href="/meal-plans" 
          icon={<Calendar className="w-6 h-6" />} 
          label="Meal Plans" 
          isActive={location.startsWith("/meal-plans")} 
        />
        
        <AddMealButton />
        
        <NavItem 
          href="/recipes" 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Recipes" 
          isActive={location.startsWith("/recipes")} 
        />
        
        <NavItem 
          href="/profile" 
          icon={<User className="w-6 h-6" />} 
          label="Profile" 
          isActive={location.startsWith("/profile")} 
        />
      </div>
    </nav>
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
    <Link href={href}>
      <a className={cn(
        "flex flex-col items-center p-2",
        isActive ? "text-primary-500" : "text-gray-500 dark:text-gray-400"
      )}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
}

function AddMealButton() {
  return (
    <div className="flex flex-col items-center p-2">
      <Link href="/add-meal">
        <a className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center -mt-5 shadow-lg">
          <Plus className="w-6 h-6 text-white" />
        </a>
      </Link>
    </div>
  );
}

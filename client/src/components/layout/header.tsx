import { Link } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { Leaf } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center">
              <Leaf className="text-secondary-500 h-6 w-6" />
              <h1 className="font-accent font-bold text-xl ml-2">
                NutriTech<span className="text-primary-500">AI</span>
              </h1>
            </a>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && <UserDropdown user={user} />}
        </div>
      </div>
    </header>
  );
}

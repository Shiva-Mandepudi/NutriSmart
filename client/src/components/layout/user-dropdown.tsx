import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut } from "lucide-react";
import { User as UserType } from "@shared/schema";

interface UserDropdownProps {
  user: Omit<UserType, "password">;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.profilePicture || ""} alt={user.username} />
          <AvatarFallback className="bg-primary-100 dark:bg-primary-700">
            {user.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:block text-sm font-medium">
          {user.firstName || user.username}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 dark:text-red-400"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

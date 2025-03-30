import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        {!isMobile && <SidebarNav />}
      </Header>
      
      <main className="flex-1 pb-16 md:pb-0 md:pl-64 pt-4">
        <div className="px-4">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
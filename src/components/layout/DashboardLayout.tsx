import { ReactNode } from "react";
import { TopBar } from "@/components/landing/TopBar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { DashboardSidebar } from "./DashboardSidebar";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: NavItem[];
  sidebarTitle: string;
}

/**
 * DashboardLayout - Layout for seller and admin dashboards
 * Includes TopBar, navigation sidebar, and content area
 */
export function DashboardLayout({ children, sidebarItems, sidebarTitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      
      <div className="flex flex-1">
        <DashboardSidebar items={sidebarItems} title={sidebarTitle} />
        
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </main>
      </div>
      
      <Footer />
      <MobileNav />
    </div>
  );
}

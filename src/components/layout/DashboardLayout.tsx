"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
function isPortalPath(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/distributor")
  );
}

export function DashboardLayout({ children, sidebarItems, sidebarTitle }: DashboardLayoutProps) {
  const pathname = usePathname();
  const portalMode = isPortalPath(pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <div className="flex flex-1">
        <DashboardSidebar items={sidebarItems} title={sidebarTitle} />

        <main className={`flex-1 overflow-y-auto ${portalMode ? "pb-0" : "pb-24 md:pb-0"}`}>
          {children}
        </main>
      </div>

      <Footer />
      {!portalMode && <MobileNav />}
    </div>
  );
}

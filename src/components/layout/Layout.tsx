import { ReactNode } from "react";
import { TopBar } from "@/components/landing/TopBar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { PageTracker } from "@/components/PageTracker";
import { CookieConsent } from "@/components/CookieConsent";
import { OpeningSoonBanner } from "@/components/launch/OpeningSoonBanner";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout - Clean layout without sidebar (categories now in header dropdown)
 * Consistent TopBar (header with category dropdown), Footer, MobileNav
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageTracker />
      <TopBar />
      <OpeningSoonBanner />

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>
      
      <Footer />
      <MobileNav />
      <CookieConsent />
    </div>
  );
}

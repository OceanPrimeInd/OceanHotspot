import { ReactNode } from "react";
import { TopBar } from "@/components/landing/TopBar";
import { Footer } from "@/components/landing/Footer";
import { MobileNav } from "@/components/landing/MobileNav";
import { PageTracker } from "@/components/PageTracker";
import { CookieConsent } from "@/components/CookieConsent";
import { WhatsAppFloatingButton } from "@/components/shop/WhatsAppButton";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Storefront layout. Categories open from the All button in the header.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageTracker />
      <TopBar />

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>
      
      <Footer />
      <MobileNav />
      <CookieConsent />
      <WhatsAppFloatingButton />
    </div>
  );
}

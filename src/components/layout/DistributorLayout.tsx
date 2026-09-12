"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

interface DistributorLayoutProps {
  children: ReactNode;
}

/**
 * DistributorLayout - Minimal layout for distributor registration/onboarding.
 * No buyer navbar, no footer, no mobile nav. Just a clean header with logo.
 */
export function DistributorLayout({ children }: DistributorLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/distributor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
      {/* Minimal header */}
      <header className="w-full border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Ocean Hotspot" className="h-8 w-auto" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Distributor Centre
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/distributor/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-white/60 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Ocean Hotspot. All rights reserved. &middot;{" "}
          <Link href="/terms" className="hover:underline">Terms</Link>{" "}
          &middot;{" "}
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}

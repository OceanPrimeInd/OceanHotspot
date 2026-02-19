"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  Menu,
  X,
  Shield,
  ShoppingCart,
  User,
  ChevronDown,
  Package,
  Settings,
  Heart,
  Store,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";


export function Navbar() {
  const { user, signOut, profile } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, [user]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const isSeller = profile?.is_seller && profile?.company_name;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Ocean Hotspot" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/sellers"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sellers
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Orders
              </Link>
              <Link
                href="/admin/disputes"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Disputes
              </Link>
              <Link
                href="/admin/returns"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Returns
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/browse"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse
              </Link>
              {isSeller ? (
                <Link
                  href="/seller/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Store className="h-4 w-4" />
                  Seller Dashboard
                </Link>
              ) : (
                <a
                  href="/sell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sell on Ocean Hotspot
                </a>
              )}
            </>
          )}
        </div>

        {/* Desktop Cart & Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-2 hover:bg-muted"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate">
                  {isAdmin && <Shield className="h-3 w-3 inline mr-1" />}
                  {profile?.full_name || profile?.company_name || user.email}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Account Dropdown */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium truncate">
                      {profile?.full_name || profile?.company_name || "My Account"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/my-orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      Wishlist
                    </Link>
                    <Link
                      href={isSeller ? "/seller/profile" : "/account/settings"}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      {isSeller ? "My Profile" : "Account Settings"}
                    </Link>

                    {isSeller && (
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Store className="h-4 w-4 text-muted-foreground" />
                        Seller Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="o42Outline" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="o42Primary" size="sm" asChild>
                <Link href="/join">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Cart & Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Cart Icon */}
          <Link
            href="/cart"
            className="relative w-10 h-10 flex items-center justify-center"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <button
            className="p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-medium flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/sellers"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sellers
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/admin/disputes"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Disputes
                </Link>
                <Link
                  href="/admin/returns"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Returns
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/browse"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                {isSeller ? (
                  <Link
                    href="/seller/dashboard"
                    className="text-sm font-medium flex items-center gap-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Store className="h-4 w-4" />
                    Seller Dashboard
                  </Link>
                ) : (
                  <a
                    href="/sell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sell on Ocean Hotspot
                  </a>
                )}
              </>
            )}
            <hr className="border-border" />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {isAdmin && <Shield className="h-3 w-3 inline mr-1" />}
                  {profile?.full_name || profile?.company_name || user.email}
                </span>
                <Link
                  href="/my-orders"
                  className="text-sm font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="text-sm font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
                <Link
                  href="/account/settings"
                  className="text-sm font-medium flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
                <hr className="border-border" />
                <Button
                  variant="o42Ghost"
                  onClick={handleSignOut}
                  className="justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="o42Outline" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="o42Primary" asChild>
                  <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

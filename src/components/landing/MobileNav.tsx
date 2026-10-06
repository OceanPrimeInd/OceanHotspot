"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Search, ShoppingCart, User, Shield, Store, Package, Heart } from "lucide-react";
import { isShopOpen } from "@/config/shop";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";

function isPortalPath(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/distributor")
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isAdmin } = useAdminCheck();

  if (isPortalPath(pathname)) {
    return null;
  }

  const isSeller = profile?.is_seller && profile?.company_name;

  // Build navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: "Home", path: "/", badge: 0 },
      { icon: Search, label: "Browse", path: "/browse", badge: 0 },
    ];

    if (isAdmin) {
      // Admin-specific navigation
      return [
        ...baseItems,
        { icon: Package, label: "Orders", path: "/admin/orders", badge: 0 },
        { icon: Shield, label: "Admin", path: "/admin", badge: 0 },
      ];
    }

    if (isSeller) {
      // Seller navigation - includes cart for when they shop
      return [
        ...baseItems,
        { icon: ShoppingCart, label: "Cart", path: "/cart", badge: itemCount },
        { icon: Store, label: "Seller", path: "/seller/dashboard", badge: 0 },
      ];
    }

    // Customer/Guest navigation
    if (!isShopOpen()) {
      return [
        ...baseItems,
        { icon: ShoppingCart, label: "Basket", path: "/cart", badge: itemCount },
        { icon: Heart, label: "Wish list", path: "/wishlist", badge: wishlistCount },
        { icon: User, label: "Account", path: user ? "/account/settings" : "/login", badge: 0 },
      ];
    }

    return [
      ...baseItems,
      { icon: ShoppingCart, label: "Cart", path: "/cart", badge: itemCount },
      { icon: User, label: "Account", path: user ? "/account/settings" : "/login", badge: 0 },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-light-grey md:hidden z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== "/" && pathname?.startsWith(item.path));
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`relative flex flex-col items-center px-3 py-1 text-xs ${
                isActive ? "text-o42-blue" : "text-dark-grey"
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6 mb-0.5" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

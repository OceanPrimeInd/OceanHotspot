"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Search, ShoppingCart, User, Shield, Store, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";

export function MobileNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { itemCount } = useCart();
  const { isAdmin } = useAdminCheck();

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
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
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

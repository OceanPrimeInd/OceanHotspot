import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MapPin,
  UserCircle,
  TrendingUp,
  Store,
  Zap,
  RefreshCw,
} from "lucide-react";

export const getDistributorNavItems = (badges?: { orders?: number }) => [
  {
    title: "Dashboard",
    href: "/distributor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products I Sell",
    href: "/distributor/products",
    icon: Package,
  },
  {
    title: "My Shop Page",
    href: "/distributor/showroom",
    icon: Store,
  },
  {
    title: "Orders",
    href: "/distributor/orders",
    icon: ShoppingCart,
    badge: badges?.orders,
  },
  {
    title: "My Earnings",
    href: "/distributor/earnings",
    icon: TrendingUp,
  },
  {
    title: "My Areas Map",
    href: "/distributor/coverage",
    icon: MapPin,
  },
  {
    title: "Find New Areas",
    href: "/distributor/expansion",
    icon: Zap,
  },
  {
    title: "Find Other Distributors",
    href: "/distributor/sourcing",
    icon: RefreshCw,
  },
  {
    title: "My Profile",
    href: "/distributor/profile",
    icon: UserCircle,
  },
];

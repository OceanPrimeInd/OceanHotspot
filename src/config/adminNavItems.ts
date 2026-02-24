import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  AlertTriangle,
  RotateCcw,
  Award,
  Users,
  Package,
  BarChart2,
} from "lucide-react";

export const getAdminNavItems = (badges?: {
  sellers?: number;
  orders?: number;
  disputes?: number;
  returns?: number;
  products?: number;
}) => [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    badge: badges?.products,
  },
  {
    title: "Sellers",
    href: "/admin/sellers",
    icon: Building2,
    badge: badges?.sellers,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    badge: badges?.orders,
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    icon: AlertTriangle,
    badge: badges?.disputes,
  },
  {
    title: "Returns",
    href: "/admin/returns",
    icon: RotateCcw,
    badge: badges?.returns,
  },
  {
    title: "Clubs",
    href: "/admin/clubs",
    icon: Award,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Google Analytics",
    href: "/admin/analytics",
    icon: BarChart2,
  },
];

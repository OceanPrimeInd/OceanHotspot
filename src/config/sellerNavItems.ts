import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Mail,
  Store,
  UserCircle,
  Upload,
  RotateCcw,
  Truck,
} from "lucide-react";

export const getSellerNavItems = (badges?: {
  orders?: number;
  enquiries?: number;
  messages?: number;
  returns?: number;
}) => [
  {
    title: "Dashboard",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/seller/products",
    icon: Package,
  },
  {
    title: "Bulk Upload",
    href: "/seller/bulk-upload",
    icon: Upload,
  },
  {
    title: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
    badge: badges?.orders,
  },
  {
    title: "Returns",
    href: "/seller/returns",
    icon: RotateCcw,
    badge: badges?.returns,
  },
  {
    title: "Customer Enquiries",
    href: "/seller/enquiries",
    icon: Mail,
    badge: badges?.enquiries,
  },
  {
    title: "Messages",
    href: "/seller/messages",
    icon: MessageSquare,
    badge: badges?.messages,
  },
  {
    title: "Distributors",
    href: "/seller/distributors",
    icon: Truck,
  },
  {
    title: "Showroom",
    href: "/seller/showroom",
    icon: Store,
  },
  {
    title: "My Profile",
    href: "/seller/profile",
    icon: UserCircle,
  },
];

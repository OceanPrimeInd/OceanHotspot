import {
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  UserCircle,
} from "lucide-react";

export const getBuyerNavItems = (badges?: {
  orders?: number;
  returns?: number;
  disputes?: number;
}) => [
  {
    title: "My Orders",
    href: "/my-orders",
    icon: ShoppingCart,
    badge: badges?.orders,
  },
  {
    title: "My Returns",
    href: "/my-returns",
    icon: RotateCcw,
    badge: badges?.returns,
  },
  {
    title: "My Disputes",
    href: "/my-disputes",
    icon: AlertTriangle,
    badge: badges?.disputes,
  },
  {
    title: "My Account",
    href: "/account/settings",
    icon: UserCircle,
  },
];

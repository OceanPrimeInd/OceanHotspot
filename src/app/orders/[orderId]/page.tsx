import type { Metadata } from "next";
import OrderDetails from "@/page-components/OrderDetails";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Order Details",
};

export default function OrderDetailsPage() {
  return <OrderDetails />;
}

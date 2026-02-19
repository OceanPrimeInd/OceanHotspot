import type { Metadata } from "next";
import PageComponent from "@/page-components/account/MyOrders";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Order history.",
};

export default function Page() {
  return <PageComponent />;
}

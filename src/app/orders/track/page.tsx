import type { Metadata } from "next";
import OrderTrack from "@/page-components/OrderTrack";

export const metadata: Metadata = {
  title: "Track Order | Ocean Hotspot",
  description: "Look up your order with email and order number.",
};

export default function Page() {
  return <OrderTrack />;
}

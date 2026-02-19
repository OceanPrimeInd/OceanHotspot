import type { Metadata } from "next";
import Checkout from "@/page-components/Checkout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Checkout",
};

export default function CheckoutPage() {
  return <Checkout />;
}

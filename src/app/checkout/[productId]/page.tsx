import type { Metadata } from "next";
import Checkout from "@/page-components/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return <Checkout />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/CartCheckout";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function Page() {
  return <PageComponent />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default function Page() {
  return <PageComponent />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Orders";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Seller Orders",
  description: "Manage your orders.",
};

export default function Page() {
  return <PageComponent />;
}

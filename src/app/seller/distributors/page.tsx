import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Distributors";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Distributor Network | Seller Dashboard",
};

export default function Page() {
  return <PageComponent />;
}

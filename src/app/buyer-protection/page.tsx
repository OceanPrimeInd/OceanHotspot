import type { Metadata } from "next";
import PageComponent from "@/page-components/BuyerProtection";

export const metadata: Metadata = {
  title: "Buyer Protection",
  description: "Buyer protection programme.",
};

export default function Page() {
  return <PageComponent />;
}

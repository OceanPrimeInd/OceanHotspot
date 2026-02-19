import type { Metadata } from "next";
import PageComponent from "@/page-components/account/BuyerProtection";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Buyer Protection",
  description: "Buyer protection.",
};

export default function Page() {
  return <PageComponent />;
}

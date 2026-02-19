import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Returns";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Seller Returns",
  description: "Manage returns.",
};

export default function Page() {
  return <PageComponent />;
}

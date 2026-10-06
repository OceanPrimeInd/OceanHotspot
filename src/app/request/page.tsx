import type { Metadata } from "next";
import PageComponent from "@/page-components/PurchaseRequest";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your request",
};

export default function Page() {
  return <PageComponent />;
}

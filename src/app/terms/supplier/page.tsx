import type { Metadata } from "next";
import PageComponent from "@/page-components/SupplierTerms";

export const metadata: Metadata = {
  title: "Supplier terms | Ocean Hotspot",
  robots: { index: true, follow: true },
};

export default function Page() {
  return <PageComponent />;
}

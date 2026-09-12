import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Products";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Vendor Portfolio | Distributor Dashboard",
};

export default function Page() {
  return <PageComponent />;
}

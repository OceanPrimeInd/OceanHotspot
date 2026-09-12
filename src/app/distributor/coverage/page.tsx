import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Coverage";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Coverage Map | Distributor Dashboard",
};

export default function Page() {
  return <PageComponent />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Dashboard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Distributor Dashboard | OceanHotspot",
};

export default function Page() {
  return <PageComponent />;
}

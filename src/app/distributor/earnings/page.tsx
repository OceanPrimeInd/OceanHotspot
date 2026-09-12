import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Earnings";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Distributor Earnings | OceanHotspot",
};

export default function Page() {
  return <PageComponent />;
}

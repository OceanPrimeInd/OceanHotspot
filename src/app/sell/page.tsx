import type { Metadata } from "next";
import PageComponent from "@/page-components/SellOnOceanHotspot";

export const metadata: Metadata = {
  title: "Sell on Ocean Hotspot",
  description: "Start selling on Ocean Hotspot",
};

export default function Page() {
  return <PageComponent />;
}

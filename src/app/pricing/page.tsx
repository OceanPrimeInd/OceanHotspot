import type { Metadata } from "next";
import PageComponent from "@/page-components/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Ocean Hotspot pricing plans.",
};

export default function Page() {
  return <PageComponent />;
}

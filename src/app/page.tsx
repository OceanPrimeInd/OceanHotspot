import type { Metadata } from "next";
import Index from "@/page-components/Index";

export const metadata: Metadata = {
  title: "Ocean Hotspot | Marine Marketplace",
  description: "The world's leading B2B maritime marketplace. Find marine equipment, boats, parts, and services.",
};

export default function HomePage() {
  return <Index />;
}

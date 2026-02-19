import type { Metadata } from "next";
import Index from "@/page-components/Index";

export const metadata: Metadata = {
  title: "Ocean Hotspot | Marine Marketplace",
  description: "The world's leading B2B maritime marketplace. Buy and sell marine equipment, boats, parts, and services from verified sellers worldwide.",
  openGraph: {
    title: "Ocean Hotspot | Marine Marketplace",
    description: "The world's leading B2B maritime marketplace. Buy and sell marine equipment, boats, parts, and services from verified sellers worldwide.",
    url: "https://oceanhotspot.com",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocean Hotspot | Marine Marketplace",
    description: "The world's leading B2B maritime marketplace. Buy and sell marine equipment, boats, parts, and services.",
    images: ["/logo.png"],
  },
};

export default function HomePage() {
  return <Index />;
}

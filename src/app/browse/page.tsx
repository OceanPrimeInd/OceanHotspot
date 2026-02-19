import type { Metadata } from "next";
import PageComponent from "@/page-components/Browse";

export const metadata: Metadata = {
  title: "Browse Marine Products & Services",
  description: "Browse thousands of marine products, equipment, boats, and services from verified sellers on Ocean Hotspot. Filter by category, price, and more.",
  openGraph: {
    title: "Browse Marine Products & Services | Ocean Hotspot",
    description: "Browse thousands of marine products, equipment, boats, and services from verified sellers worldwide.",
    url: "https://oceanhotspot.com/browse",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Marine Products & Services | Ocean Hotspot",
    description: "Browse thousands of marine products, equipment, boats, and services from verified sellers worldwide.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

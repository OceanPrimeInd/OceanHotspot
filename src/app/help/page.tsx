import type { Metadata } from "next";
import PageComponent from "@/page-components/Help";

export const metadata: Metadata = {
  title: "Help & Support | Ocean Hotspot",
  description: "Find answers to common questions about buying, selling, orders, payments, and account management on Ocean Hotspot.",
  openGraph: {
    title: "Help & Support | Ocean Hotspot",
    description: "Find answers to common questions about buying, selling, orders, payments, and account management.",
    url: "https://oceanhotspot.com/help",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Help & Support | Ocean Hotspot",
    description: "Find answers to common questions about buying, selling, orders, and payments.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

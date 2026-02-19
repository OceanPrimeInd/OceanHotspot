import type { Metadata } from "next";
import PageComponent from "@/page-components/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works | Ocean Hotspot",
  description: "Learn how Ocean Hotspot works for buyers and sellers. Discover our secure payment system, buyer protection, and easy product listing process.",
  openGraph: {
    title: "How It Works | Ocean Hotspot",
    description: "Learn how Ocean Hotspot works for buyers and sellers. Secure payments, buyer protection, and easy listing.",
    url: "https://oceanhotspot.com/how-it-works",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | Ocean Hotspot",
    description: "Learn how Ocean Hotspot works for buyers and sellers. Secure payments, buyer protection, and easy listing.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

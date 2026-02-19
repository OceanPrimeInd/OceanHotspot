import type { Metadata } from "next";
import PageComponent from "@/page-components/Pricing";

export const metadata: Metadata = {
  title: "Pricing | Ocean Hotspot",
  description: "Ocean Hotspot pricing for sellers. No listing fees — we only charge a small commission when you make a sale. Transparent, fair, and simple.",
  openGraph: {
    title: "Pricing | Ocean Hotspot",
    description: "No listing fees — we only charge a small commission when you make a sale. Transparent and fair pricing.",
    url: "https://oceanhotspot.com/pricing",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pricing | Ocean Hotspot",
    description: "No listing fees — we only charge a small commission when you make a sale.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

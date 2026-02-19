import type { Metadata } from "next";
import PageComponent from "@/page-components/BuyerProtection";

export const metadata: Metadata = {
  title: "Buyer Protection | Ocean Hotspot",
  description: "Ocean Hotspot buyer protection ensures your funds are secure. Payments are held until delivery is confirmed, protecting every purchase.",
  openGraph: {
    title: "Buyer Protection | Ocean Hotspot",
    description: "Your funds are secure with Ocean Hotspot. Payments held until delivery confirmed — shop with confidence.",
    url: "https://oceanhotspot.com/buyer-protection",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buyer Protection | Ocean Hotspot",
    description: "Your funds are secure with Ocean Hotspot. Payments held until delivery confirmed.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

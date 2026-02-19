import type { Metadata } from "next";
import PageComponent from "@/page-components/SellOnOceanHotspot";

export const metadata: Metadata = {
  title: "Sell on Ocean Hotspot | Maritime Marketplace for Sellers",
  description: "Join Ocean Hotspot as a seller. List your marine products and services to a global audience of vessel owners, operators, and maritime businesses. No listing fees.",
  openGraph: {
    title: "Sell on Ocean Hotspot | Maritime Marketplace for Sellers",
    description: "Join Ocean Hotspot as a seller. No listing fees. Reach a global maritime audience and grow your marine business online.",
    url: "https://oceanhotspot.com/sell",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell on Ocean Hotspot | Maritime Marketplace for Sellers",
    description: "Join Ocean Hotspot as a seller. No listing fees. Reach a global maritime audience.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

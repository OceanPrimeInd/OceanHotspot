import type { Metadata } from "next";
import PageComponent from "@/page-components/SellOnOceanHotspot";

export const metadata: Metadata = {
  title: "Sell with Ocean Hotspot | Your showroom, your brand",
  description:
    "Your showroom. Your brand. Your customers. Join before opening day, load products now, and pay nothing until something sells.",
  openGraph: {
    title: "Sell with Ocean Hotspot | Your showroom, your brand",
    description:
      "Suppliers can set up a showroom and load products ahead of opening day. You pay nothing until something sells.",
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

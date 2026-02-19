import type { Metadata } from "next";
import PageComponent from "@/page-components/Discover";

export const metadata: Metadata = {
  title: "Discover Marine Products | Ocean Hotspot",
  description: "Discover new and featured marine products, equipment, and services curated for maritime professionals and vessel owners.",
  openGraph: {
    title: "Discover Marine Products | Ocean Hotspot",
    description: "Discover new and featured marine products, equipment, and services curated for maritime professionals and vessel owners.",
    url: "https://oceanhotspot.com/discover",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Marine Products | Ocean Hotspot",
    description: "Discover new and featured marine products, equipment, and services curated for maritime professionals.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

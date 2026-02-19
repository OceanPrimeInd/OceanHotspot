import type { Metadata } from "next";
import PageComponent from "@/page-components/About";

export const metadata: Metadata = {
  title: "About Ocean Hotspot | Our Mission & Story",
  description: "Learn about Ocean Hotspot — the B2B maritime marketplace connecting buyers and sellers across the global marine industry.",
  openGraph: {
    title: "About Ocean Hotspot | Our Mission & Story",
    description: "Learn about Ocean Hotspot — the B2B maritime marketplace connecting buyers and sellers across the global marine industry.",
    url: "https://oceanhotspot.com/about",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ocean Hotspot | Our Mission & Story",
    description: "Learn about Ocean Hotspot — the B2B maritime marketplace connecting buyers and sellers across the global marine industry.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

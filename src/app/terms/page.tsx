import type { Metadata } from "next";
import PageComponent from "@/page-components/Terms";

export const metadata: Metadata = {
  title: "Terms of Service | Ocean Hotspot",
  description: "Read the Ocean Hotspot Terms of Service. Understand your rights and responsibilities as a buyer or seller on our maritime marketplace.",
  openGraph: {
    title: "Terms of Service | Ocean Hotspot",
    description: "Read the Ocean Hotspot Terms of Service for buyers and sellers.",
    url: "https://oceanhotspot.com/terms",
    siteName: "Ocean Hotspot",
    type: "website",
  },
  twitter: { card: "summary", title: "Terms of Service | Ocean Hotspot" },
};

export default function Page() {
  return <PageComponent />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/Returns";

export const metadata: Metadata = {
  title: "Returns Policy | Ocean Hotspot",
  description: "Understand the Ocean Hotspot returns and refund policy for buyers and sellers on our maritime marketplace.",
  openGraph: {
    title: "Returns Policy | Ocean Hotspot",
    description: "Understand the Ocean Hotspot returns and refund policy for buyers and sellers.",
    url: "https://oceanhotspot.com/returns",
    siteName: "Ocean Hotspot",
    type: "website",
  },
  twitter: { card: "summary", title: "Returns Policy | Ocean Hotspot" },
};

export default function Page() {
  return <PageComponent />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/Contact";

export const metadata: Metadata = {
  title: "Contact Us | Ocean Hotspot",
  description: "Get in touch with the Ocean Hotspot team. We're here to help buyers and sellers with any questions about our maritime marketplace.",
  openGraph: {
    title: "Contact Us | Ocean Hotspot",
    description: "Get in touch with the Ocean Hotspot team. We're here to help buyers and sellers with any questions.",
    url: "https://oceanhotspot.com/contact",
    siteName: "Ocean Hotspot",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Ocean Hotspot" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | Ocean Hotspot",
    description: "Get in touch with the Ocean Hotspot team.",
    images: ["/logo.png"],
  },
};

export default function Page() {
  return <PageComponent />;
}

import type { Metadata } from "next";
import PageComponent from "@/page-components/Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Ocean Hotspot",
  description: "Read the Ocean Hotspot Privacy Policy. Learn how we collect, use, and protect your personal data.",
  openGraph: {
    title: "Privacy Policy | Ocean Hotspot",
    description: "Learn how Ocean Hotspot collects, uses, and protects your personal data.",
    url: "https://oceanhotspot.com/privacy",
    siteName: "Ocean Hotspot",
    type: "website",
  },
  twitter: { card: "summary", title: "Privacy Policy | Ocean Hotspot" },
};

export default function Page() {
  return <PageComponent />;
}

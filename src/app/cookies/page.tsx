import type { Metadata } from "next";
import PageComponent from "@/page-components/Cookies";

export const metadata: Metadata = {
  title: "Cookie Policy | Ocean Hotspot",
  description: "Learn about how Ocean Hotspot uses cookies and similar technologies on our maritime marketplace platform.",
  openGraph: {
    title: "Cookie Policy | Ocean Hotspot",
    description: "Learn about how Ocean Hotspot uses cookies and similar technologies.",
    url: "https://oceanhotspot.com/cookies",
    siteName: "Ocean Hotspot",
    type: "website",
  },
  twitter: { card: "summary", title: "Cookie Policy | Ocean Hotspot" },
};

export default function Page() {
  return <PageComponent />;
}

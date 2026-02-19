import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Ocean Hotspot | Marine Marketplace",
    template: "%s | Ocean Hotspot",
  },
  description: "The world's leading B2B maritime marketplace. Browse marine equipment, boats, parts, and services from verified sellers worldwide.",
  keywords: ["marine", "maritime", "boat", "yacht", "marine equipment", "boat parts", "maritime marketplace"],
  authors: [{ name: "Ocean Hotspot" }],
  creator: "Ocean Hotspot",
  metadataBase: new URL("https://oceanhotspot.com"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://oceanhotspot.com",
    siteName: "Ocean Hotspot",
    title: "Ocean Hotspot | Marine Marketplace",
    description: "The world's leading B2B maritime marketplace. Browse marine equipment, boats, parts, and services from verified sellers worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocean Hotspot | Marine Marketplace",
    description: "The world's leading B2B maritime marketplace.",
    creator: "@oceanhotspot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

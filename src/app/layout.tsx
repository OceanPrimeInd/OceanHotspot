import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
  weight: ["400", "500", "600", "700", "800"],
});

/** Keeps auth/search-param pages reliable; homepage still cached at CDN after first hit. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Marine parts & equipment | Ocean Hotspot",
    template: "%s | Ocean Hotspot",
  },
  description:
    "Parts, equipment and spares for boats up to 24m — sold by makers and distributors you can talk to. UK marketplace.",
  keywords: ["marine", "maritime", "boat", "yacht", "marine equipment", "boat parts", "maritime marketplace", "marine products"],
  authors: [{ name: "Ocean Hotspot" }],
  creator: "Ocean Hotspot",
  metadataBase: new URL("https://www.oceanhotspot.com"),
  alternates: {
    canonical: "https://www.oceanhotspot.com",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.oceanhotspot.com",
    siteName: "Ocean Hotspot",
    title: "Marine parts & equipment | Ocean Hotspot",
    description: "Parts and equipment for boats up to 24m from verified sellers.",
    images: [
      {
        url: "https://www.oceanhotspot.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ocean Hotspot - B2B Maritime Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Maritime Marketplace | Ocean Hotspot",
    description: "Buy and sell marine products and services.",
    creator: "@oceanhotspot",
    images: ["https://www.oceanhotspot.com/og-image.jpg"],
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
    <html lang="en" suppressHydrationWarning className={publicSans.variable}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

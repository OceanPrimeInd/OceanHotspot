import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ShowroomPublic from "@/page-components/ShowroomPublic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tradingName = decodeURIComponent(slug).replace(/-/g, " ");

  const { data: seller } = await supabase
    .from("profiles")
    .select("company_name, trading_name, bio")
    .ilike("trading_name", tradingName)
    .eq("is_seller", true)
    .maybeSingle();

  const name = seller?.trading_name || seller?.company_name || tradingName;
  const title = `${name} | Seller Showroom on Ocean Hotspot`;
  const description = seller?.bio
    ? seller.bio.slice(0, 160)
    : `Browse products and services from ${name} on Ocean Hotspot — the maritime marketplace.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://oceanhotspot.com/showroom/${slug}`,
      siteName: "Ocean Hotspot",
      images: [{ url: "/logo.png", width: 512, height: 512, alt: name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default function ShowroomPage() {
  return <ShowroomPublic />;
}

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ShowroomPublic from "@/page-components/ShowroomPublic";
import { shopperBrandName } from "@/lib/publicBrand";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();

  const { data: showroom } = await supabase
    .from("showrooms")
    .select("brand_name, tagline, slug")
    .eq("slug", normalizedSlug)
    .eq("is_published", true)
    .maybeSingle();

  const name = shopperBrandName(showroom?.brand_name, null) || normalizedSlug.replace(/-/g, " ");
  const title = `${name} | Verified Vendor Showroom on Ocean Hotspot`;
  const description = showroom?.tagline
    ? showroom.tagline.slice(0, 160)
    : `Browse products from ${name} — verified maritime vendor on Ocean Hotspot.`;

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

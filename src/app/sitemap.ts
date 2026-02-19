import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://oceanhotspot.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/discover`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/sell`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/buyer-protection`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Fetch all published products
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, updated_at")
      .eq("is_published", true)
      .limit(5000);

    if (products) {
      productPages = products.map((p) => ({
        url: `${baseUrl}/product/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error("Sitemap: error fetching products:", e);
  }

  // Fetch all category browse pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const { data: categories } = await supabase
      .from("domain_labels")
      .select("code");

    if (categories) {
      categoryPages = categories.map((c) => ({
        url: `${baseUrl}/browse?domain=${encodeURIComponent(c.code)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap: error fetching categories:", e);
  }

  // Fetch all public seller showrooms
  let showroomPages: MetadataRoute.Sitemap = [];
  try {
    const { data: sellers } = await supabase
      .from("profiles")
      .select("trading_name, updated_at")
      .eq("is_seller", true)
      .not("trading_name", "is", null)
      .limit(1000);

    if (sellers) {
      showroomPages = sellers
        .filter((s) => s.trading_name)
        .map((s) => ({
          url: `${baseUrl}/showroom/${encodeURIComponent(s.trading_name.toLowerCase().replace(/\s+/g, "-"))}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch (e) {
    console.error("Sitemap: error fetching showrooms:", e);
  }

  return [...staticPages, ...categoryPages, ...productPages, ...showroomPages];
}

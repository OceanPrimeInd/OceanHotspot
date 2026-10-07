import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductDetail from "@/page-components/ProductDetail";
import { isHiddenSupplierBrand } from "@/lib/publicBrand";
import { isMissingProductImage } from "@/lib/productImage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("title, description, price, currency, image_url, brand")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (!product) {
    return { title: "Product Not Found | Ocean Hotspot", robots: { index: false } };
  }

  const brand = product.brand && !isHiddenSupplierBrand(product.brand) ? ` by ${product.brand}` : "";
  const title = `${product.title}${brand} | Ocean Hotspot`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.title} on Ocean Hotspot — the maritime marketplace.`;
  const image = product.image_url && !isMissingProductImage(product.image_url) ? product.image_url : "/logo.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://oceanhotspot.com/product/${id}`,
      siteName: "Ocean Hotspot",
      images: [{ url: image, width: 800, height: 600, alt: product.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductPage() {
  return <ProductDetail />;
}

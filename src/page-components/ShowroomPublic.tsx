// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import {
  Loader2,
  Package,
  Globe,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

interface Showroom {
  id: string;
  seller_id: string;
  slug: string;
  brand_name: string;
  tagline: string | null;
  about_text: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
}

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  domain_category: string | null;
}

const ShowroomPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowroom = async () => {
      if (!slug) return;

      const { data: showroomData, error: showroomError } = await supabase
        .from("showrooms")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (showroomError || !showroomData) {
        setLoading(false);
        return;
      }

      setShowroom(showroomData);

      // Fetch seller's products
      const { data: productsData } = await supabase
        .from("products")
        .select("id, title, price, currency, image_url, domain_category")
        .eq("seller_id", showroomData.seller_id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setProducts(productsData || []);
      setLoading(false);
    };

    fetchShowroom();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!showroom) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-headline mb-4">
            Showroom Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This showroom doesn't exist or is not publicly available.
          </p>
          <Button variant="o42Primary" asChild>
            <Link href="/browse">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Banner */}
      <div
        className="h-48 md:h-64 bg-gradient-to-r"
        style={{
          background: showroom.banner_url
            ? `url(${showroom.banner_url}) center/cover`
            : `linear-gradient(135deg, ${showroom.primary_color}, ${showroom.secondary_color})`,
        }}
      />

      <div className="container -mt-16 relative z-10 pb-12">
        {/* Header */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {showroom.logo_url ? (
                <img
                  src={showroom.logo_url}
                  alt={showroom.brand_name}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl bg-white border border-border"
                />
              ) : (
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-xl flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: showroom.primary_color }}
                >
                  {showroom.brand_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-headline mb-2">
                {showroom.brand_name}
              </h1>
              {showroom.tagline && (
                <p className="text-lg text-muted-foreground mb-4">
                  {showroom.tagline}
                </p>
              )}
              
              {/* Contact Links */}
              <div className="flex flex-wrap gap-4">
                {showroom.website_url && (
                  <a
                    href={showroom.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {showroom.contact_email && (
                  <a
                    href={`mailto:${showroom.contact_email}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {showroom.contact_email}
                  </a>
                )}
                {showroom.contact_phone && (
                  <a
                    href={`tel:${showroom.contact_phone}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {showroom.contact_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {showroom.about_text && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-headline mb-4">About Us</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {showroom.about_text}
            </p>
          </div>
        )}

        {/* Products */}
        <div>
          <h2 className="text-xl font-bold text-headline mb-6">
            Our Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="bg-muted/30 rounded-xl border border-dashed border-border p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products listed yet</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group rounded-lg border border-border bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-primary/50" />
                    )}
                  </div>
                  <div className="p-4">
                    {product.domain_category && (
                      <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary mb-2">
                        {product.domain_category}
                      </span>
                    )}
                    <h3 className="font-semibold text-headline group-hover:text-primary transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-lg font-bold text-headline mt-2">
                      {formatPrice(product.currency, product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShowroomPublic;

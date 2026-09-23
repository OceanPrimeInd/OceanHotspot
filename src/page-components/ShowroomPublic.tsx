// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getProductCategoryLabel } from "@/config/productCategories";
import { CONTACT_EMAIL } from "@/config/contact";
import { isCustomerCheckoutEnabled } from "@/config/launch";
import { OpeningSoonWatermark } from "@/components/launch/OpeningSoonWatermark";
import {
  Loader2, Package, Globe, Mail, Phone, ExternalLink,
  MapPin, Calendar, Instagram, Linkedin, Twitter, Facebook,
  Send, ChevronRight, Award, ArrowRight, MessageSquare, CheckCircle2,
} from "lucide-react";

// ─── Brand palette ────────────────────────────────────────────────────────────
// Defaults: deep navy + website orange. Overridden per-vendor from DB.
const BRAND_NAVY   = "#1a3560";   // deep professional navy (website headline hue)
const BRAND_ORANGE = "#FF6B14";   // website secondary: hsl(20 100% 54%)

// ─── Types ────────────────────────────────────────────────────────────────────

interface Showroom {
  id: string; seller_id: string; slug: string; brand_name: string;
  tagline: string | null; about_text: string | null;
  logo_url: string | null; banner_url: string | null;
  primary_color: string; secondary_color: string;
  contact_email: string | null; contact_phone: string | null;
  website_url: string | null; instagram_url: string | null;
  linkedin_url: string | null; twitter_url: string | null;
  facebook_url: string | null; years_in_business: number | null;
  location: string | null;
}

interface Product {
  id: string; title: string; price: number; currency: string;
  image_url: string | null; domain_category: string | null;
  description: string | null;
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─── Sample posts ─────────────────────────────────────────────────────────────

const SAMPLE_POSTS = [
  {
    id: 1,
    title: "Introducing Our Next-Generation AIS Transponder Series",
    excerpt: "The maritime industry demands precision and reliability. Our latest AIS transponder series sets a new benchmark for vessel tracking accuracy in coastal and offshore environments.",
    date: "12 Feb 2026", category: "Product Launch",
  },
  {
    id: 2,
    title: "How Modern ECDIS is Transforming Bridge Navigation",
    excerpt: "Electronic Chart Display systems have evolved dramatically. We explore the latest advances in route planning, collision avoidance, and integration with onboard sensor networks.",
    date: "28 Jan 2026", category: "Industry Insight",
  },
  {
    id: 3,
    title: "Photon Marine at Europort 2026: What to Expect",
    excerpt: "We're exhibiting at Europort Amsterdam this year. Join us at Stand B214 to see live demos of our satcom, radar, and integrated bridge systems.",
    date: "5 Jan 2026", category: "News & Events",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ShowroomPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiry, setEnquiry] = useState({ buyer_name: "", buyer_email: "", buyer_phone: "", message: "" });
  const { toast } = useToast();

  useEffect(() => {
    const fetchShowroom = async () => {
      if (!slug) return;
      const normalizedSlug = decodeURIComponent(slug).toLowerCase();

      let showroomData = null;

      const { data: bySlug } = await supabase
        .from("showrooms")
        .select("*")
        .eq("slug", normalizedSlug)
        .eq("is_published", true)
        .maybeSingle();

      showroomData = bySlug;

      if (!showroomData) {
        const { data: publishedShowrooms } = await supabase
          .from("showrooms")
          .select("*")
          .eq("is_published", true);

        showroomData =
          publishedShowrooms?.find(
            (entry) =>
              entry.slug?.toLowerCase() === normalizedSlug ||
              slugify(entry.brand_name || "") === normalizedSlug,
          ) ?? null;
      }

      if (!showroomData) {
        const { data: sellers } = await supabase
          .from("profiles")
          .select("id, trading_name, company_name")
          .eq("is_seller", true);

        const matchedSeller = sellers?.find((seller) => {
          const name = seller.trading_name || seller.company_name || "";
          return slugify(name) === normalizedSlug;
        });

        if (matchedSeller) {
          const { data: bySeller } = await supabase
            .from("showrooms")
            .select("*")
            .eq("seller_id", matchedSeller.id)
            .eq("is_published", true)
            .maybeSingle();
          showroomData = bySeller;
        }
      }

      if (!showroomData) {
        setLoading(false);
        return;
      }

      setShowroom(showroomData);
      const { data: productsData } = await supabase
        .from("products")
        .select("id, title, price, currency, image_url, domain_category, description")
        .eq("seller_id", showroomData.seller_id).eq("is_published", true)
        .order("created_at", { ascending: false });
      setProducts(productsData || []);
      setLoading(false);
    };
    fetchShowroom();
  }, [slug]);

  // Use stored vendor colors, fall back to deep navy + orange
  const P  = showroom?.primary_color   || BRAND_NAVY;
  const S  = showroom?.secondary_color || BRAND_ORANGE;

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.domain_category).filter(Boolean)))];
  const filtered   = activeCategory === "all" ? products : products.filter((p) => p.domain_category === activeCategory);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showroom) return;
    setEnquiryLoading(true);
    const { error } = await supabase.from("enquiries").insert({
      seller_id: showroom.seller_id, product_id: null,
      buyer_name: enquiry.buyer_name, buyer_email: enquiry.buyer_email,
      buyer_phone: enquiry.buyer_phone || null, message: enquiry.message, is_read: false,
    });
    setEnquiryLoading(false);
    if (error) { toast({ title: "Failed to send", description: "Please try again or email us directly.", variant: "destructive" }); return; }

    if (showroom.contact_email) {
      supabase.functions.invoke("send-email", {
        body: {
          type: "enquiry_notification",
          to: showroom.contact_email,
          data: {
            buyerName: enquiry.buyer_name,
            buyerEmail: enquiry.buyer_email,
            message: enquiry.message,
            dashboardUrl: `${window.location.origin}/seller/enquiries`,
          },
        },
      }).catch(() => undefined);
    }

    setEnquirySent(true);
    setEnquiry({ buyer_name: "", buyer_email: "", buyer_phone: "", message: "" });
  };

  if (loading) return (
    <Layout><div className="flex items-center justify-center py-32">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div></Layout>
  );

  if (!showroom) return (
    <Layout><div className="container py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold text-headline mb-3">Showroom Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">This vendor showroom doesn't exist or is not currently available.</p>
      <Button variant="o42Primary" asChild><Link href="/browse">Browse All Products</Link></Button>
    </div></Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: "#F4F7FB" }}>

        {/* ── 1. HERO ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
          {/* Background */}
          {showroom.banner_url ? (
            <>
              <img src={showroom.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${P}f0 0%, ${P}99 55%, ${P}44 100%)` }} />
            </>
          ) : (
            <>
              {/* Rich textured gradient — looks great without a photo */}
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${P} 0%, #0d2347 40%, #162d52 70%, #1a3a6a 100%)` }} />
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: S }} />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10" style={{ background: S }} />
              {/* Wave accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: S }} />
            </>
          )}

          {/* Hero content */}
          <div className="relative container py-16 md:py-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            {/* Logo card */}
            <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-2xl overflow-hidden bg-white flex items-center justify-center border-4 border-white/30">
              {showroom.logo_url ? (
                <img src={showroom.logo_url} alt={showroom.brand_name} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white" style={{ background: `linear-gradient(135deg, ${S}, ${S}99)` }}>
                  {showroom.brand_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Text */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: S + "25", color: S, border: `1px solid ${S}50` }}>
                <Award className="h-3 w-3" /> Verified Maritime Vendor
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
                {showroom.brand_name}
              </h1>
              {showroom.tagline && (
                <p className="mt-3 text-lg md:text-xl max-w-2xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                  {showroom.tagline}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. STATS BAR ─────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container py-3">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {showroom.years_in_business && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: S }} />
                  <span className="text-sm font-semibold text-gray-700">{showroom.years_in_business} Years in Business</span>
                </div>
              )}
              {showroom.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: S }} />
                  <span className="text-sm font-semibold text-gray-700">{showroom.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" style={{ color: S }} />
                <span className="text-sm font-semibold text-gray-700">{products.length} Products Listed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" style={{ color: S }} />
                <span className="text-sm font-semibold text-gray-700">Verified Supplier</span>
              </div>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 text-sm font-bold ml-auto transition-opacity hover:opacity-75"
                style={{ color: P }}
              >
                <Mail className="h-4 w-4" /> Order via Ocean Hotspot
              </Link>
            </div>
          </div>
        </div>

        <div className="container py-12 space-y-14">

          {/* ── 3. ABOUT + CONTACT ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* About */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: S }} />
                <h2 className="text-2xl font-black text-headline">About Us</h2>
              </div>
              {showroom.about_text ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">{showroom.about_text}</p>
              ) : (
                <p className="text-muted-foreground italic">No about information provided yet.</p>
              )}
            </div>

            {/* Contact card */}
            <div className="rounded-2xl p-6 shadow-xl text-white" style={{ background: `linear-gradient(160deg, ${P} 0%, #0d2347 100%)` }}>
              <h3 className="text-lg font-black mb-5" style={{ color: S }}>Get in Touch</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Order enquiry — ${showroom.brand_name} showroom`)}`}
                  className="flex items-center gap-3 text-white/85 hover:text-white transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: S + "30" }}
                  >
                    <Mail className="h-4 w-4" style={{ color: S }} />
                  </div>
                  <span className="text-sm break-all">{CONTACT_EMAIL}</span>
                </a>
                <p className="text-xs text-white/70 leading-relaxed">
                  Purchases go through Ocean Hotspot. We confirm price, payment (including bank transfer), and
                  dispatch with the supplier.
                </p>
              </div>

              {/* Social */}
              {(showroom.instagram_url || showroom.linkedin_url || showroom.twitter_url || showroom.facebook_url) && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Follow Us</p>
                  <div className="flex gap-2">
                    {showroom.instagram_url && (
                      <a href={showroom.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: S }}>
                        <Instagram className="h-4 w-4 text-white" />
                      </a>
                    )}
                    {showroom.linkedin_url && (
                      <a href={showroom.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: S }}>
                        <Linkedin className="h-4 w-4 text-white" />
                      </a>
                    )}
                    {showroom.twitter_url && (
                      <a href={showroom.twitter_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: S }}>
                        <Twitter className="h-4 w-4 text-white" />
                      </a>
                    )}
                    {showroom.facebook_url && (
                      <a href={showroom.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: S }}>
                        <Facebook className="h-4 w-4 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setEnquiryOpen(true); setTimeout(() => document.getElementById("enquiry-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                className="mt-5 w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: S, color: "#fff" }}>
                <MessageSquare className="h-4 w-4" /> Send an Enquiry
              </button>
            </div>
          </div>

          {/* ── 4. PRODUCTS ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: S }} />
              <h2 className="text-2xl font-black text-headline">
                Our Products <span className="text-gray-400 font-normal text-lg">({products.length})</span>
              </h2>
            </div>

            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border"
                    style={activeCategory === cat
                      ? { backgroundColor: P, color: "#fff", borderColor: P }
                      : { backgroundColor: "#fff", color: "#374151", borderColor: "#E5E7EB" }}>
                    {cat === "all" ? "All Products" : getProductCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center bg-white">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No products listed yet.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}
                    className="group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-4/3 overflow-hidden relative bg-gray-50">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${P}12, ${S}12)` }}>
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      {product.domain_category && (
                        <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow"
                          style={{ backgroundColor: P }}>
                          {getProductCategoryLabel(product.domain_category)}
                        </span>
                      )}
                      {!isCustomerCheckoutEnabled() && <OpeningSoonWatermark />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-base font-black" style={{ color: P }}>
                          {formatPrice(product.currency, product.price)}
                        </p>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center transition-colors group-hover:brightness-110"
                          style={{ backgroundColor: S + "20" }}>
                          <ArrowRight className="h-3.5 w-3.5" style={{ color: S }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── 5. OUR STORY ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: S }} />
                <h2 className="text-2xl font-black text-headline">Our Story</h2>
              </div>
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium">
                Sample content
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SAMPLE_POSTS.map((post, i) => (
                <div key={post.id}
                  className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  {/* Coloured top band */}
                  <div className="h-32 flex items-end p-5 relative overflow-hidden"
                    style={{ background: i === 0
                      ? `linear-gradient(135deg, ${P}, #0d2347)`
                      : i === 1
                      ? `linear-gradient(135deg, #0d2347, #162d52)`
                      : `linear-gradient(135deg, #162d52, ${P})` }}>
                    {/* Subtle pattern */}
                    <div className="absolute inset-0 opacity-5" style={{
                      backgroundImage: `radial-gradient(${S} 1px, transparent 1px)`,
                      backgroundSize: "20px 20px"
                    }} />
                    <span className="relative z-10 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: S }}>
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">{post.date}</p>
                    <h3 className="font-bold text-gray-800 leading-snug mb-3 group-hover:text-primary transition-colors text-sm">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: P }}>
                      Read more <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 6. ENQUIRY ───────────────────────────────────────────────── */}
          <div id="enquiry-section">
            {/* CTA */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{ background: `linear-gradient(120deg, ${P} 0%, #0d2347 60%, #1a3a6a 100%)` }}>
              {/* Decorative accent line */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: S }} />
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Interested in a product?</h2>
                  <p className="max-w-lg text-sm md:text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
                    For bespoke quotes, high-value orders, or technical questions — send us an enquiry and our team will respond within one business day.
                  </p>
                </div>
                {!enquiryOpen && !enquirySent && (
                  <button onClick={() => setEnquiryOpen(true)}
                    className="shrink-0 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 whitespace-nowrap shadow-lg"
                    style={{ backgroundColor: S, color: "#fff" }}>
                    <Send className="h-4 w-4" /> Send an Enquiry
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            {enquirySent ? (
              <div className="mt-6 rounded-2xl bg-white border-2 p-10 text-center shadow-sm" style={{ borderColor: S }}>
                <CheckCircle2 className="mx-auto h-14 w-14 mb-4" style={{ color: S }} />
                <h3 className="text-xl font-black text-headline mb-2">Enquiry Sent!</h3>
                <p className="text-gray-500 mb-6">Thank you. {showroom.brand_name} will be in touch shortly.</p>
                <button onClick={() => { setEnquirySent(false); setEnquiryOpen(false); }}
                  className="text-sm font-semibold underline" style={{ color: P }}>
                  Send another enquiry
                </button>
              </div>
            ) : enquiryOpen ? (
              <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-headline mb-6">Contact {showroom.brand_name}</h3>
                <form onSubmit={handleEnquiry} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="buyer_name">Your Name *</Label>
                      <Input id="buyer_name" placeholder="John Smith" value={enquiry.buyer_name}
                        onChange={(e) => setEnquiry({ ...enquiry, buyer_name: e.target.value })} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer_email">Email Address *</Label>
                      <Input id="buyer_email" type="email" placeholder="you@company.com" value={enquiry.buyer_email}
                        onChange={(e) => setEnquiry({ ...enquiry, buyer_email: e.target.value })} required className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyer_phone">Phone (optional)</Label>
                    <Input id="buyer_phone" type="tel" placeholder="+44 7700 000000" value={enquiry.buyer_phone}
                      onChange={(e) => setEnquiry({ ...enquiry, buyer_phone: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <textarea id="message" rows={5}
                      placeholder="Tell us what you're looking for, quantities needed, or any technical questions..."
                      value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} required
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={enquiryLoading}
                      className="px-8 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ backgroundColor: P }}>
                      {enquiryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {enquiryLoading ? "Sending..." : "Send Enquiry"}
                    </button>
                    <button type="button" onClick={() => setEnquiryOpen(false)}
                      className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── 7. FOOTER ────────────────────────────────────────────────── */}
        <div className="mt-12 border-t border-gray-200 bg-white">
          <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {showroom.logo_url && <img src={showroom.logo_url} alt={showroom.brand_name} className="h-7 w-auto object-contain" />}
              <span className="font-bold text-gray-800 text-sm">{showroom.brand_name}</span>
              <span className="text-gray-400 text-xs">· Verified Hotspot Vendor</span>
            </div>
            <div className="flex items-center gap-2">
              {showroom.instagram_url && (
                <a href={showroom.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = ""; }}>
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {showroom.linkedin_url && (
                <a href={showroom.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = ""; }}>
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-600">Ocean Hotspot</span></p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ShowroomPublic;

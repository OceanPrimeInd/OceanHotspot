// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin, Globe, Mail, Phone, Instagram, Linkedin,
  ExternalLink, Package, Send, Loader2, CheckCircle2,
  Truck, Award, ArrowRight, MessageSquare, Anchor, Shield,
} from "lucide-react";
import { getProductCategoryLabel } from "@/config/productCategories";

// Fixed amber accent — matches the platform's maritime palette
const BRAND_AMBER = "#F59E0B";

interface Props {
  distributorId: string;
}

export default function DistributorShowroomPublic({ distributorId }: Props) {
  const [distributor, setDistributor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: "", email: "", phone: "", message: "" });

  useEffect(() => {
    loadData();
  }, [distributorId]);

  const loadData = async () => {
    setLoading(true);
    const [distRes, portRes] = await Promise.all([
      supabase
        .from("distributors")
        .select("id, company_name, status, location, coverage_areas, specializations, commission_rate, showroom_tagline, showroom_banner_url, showroom_logo_url, showroom_color, about_text, website_url, contact_email, contact_phone, instagram_url, linkedin_url")
        .eq("id", distributorId)
        .eq("status", "approved")
        .maybeSingle(),
      supabase
        .from("distributor_products")
        .select("product_id, products(id, title, price, currency, pricing_type, image_url, description, domain_category)")
        .eq("distributor_id", distributorId)
        .eq("status", "active")
        .limit(24),
    ]);

    setDistributor(distRes.data);
    setProducts((portRes.data || []).map((dp: any) => dp.products).filter(Boolean));
    setLoading(false);
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry.name || !enquiry.email || !enquiry.message) return;
    setEnquiryLoading(true);
    await supabase.from("enquiries").insert({
      seller_id: distributor.id,
      product_id: null,
      buyer_name: enquiry.name,
      buyer_email: enquiry.email,
      buyer_phone: enquiry.phone || null,
      message: enquiry.message,
    });
    setEnquiryLoading(false);
    setEnquirySent(true);
    setEnquiry({ name: "", email: "", phone: "", message: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: BRAND_AMBER }} />
      </div>
    );
  }

  if (!distributor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Truck className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Distributor Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          This distributor page doesn't exist or is not currently available.
        </p>
        <Button asChild>
          <Link href="/">Browse Ocean Hotspot</Link>
        </Button>
      </div>
    );
  }

  const P = distributor.showroom_color || "#1a3560";
  const S = BRAND_AMBER;

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p: any) => p.domain_category).filter(Boolean))),
  ];
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p: any) => p.domain_category === activeCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F7FB" }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
        {distributor.showroom_banner_url ? (
          <>
            <img
              src={distributor.showroom_banner_url}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(120deg, ${P}f0 0%, ${P}99 55%, ${P}44 100%)` }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${P} 0%, #0d2347 40%, #162d52 70%, #1a3a6a 100%)` }}
            />
            {/* Decorative circles — maritime depth effect */}
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: S }} />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10" style={{ background: S }} />
            {/* Accent wave line */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: S }} />
          </>
        )}

        {/* Hero content */}
        <div className="relative container py-16 md:py-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          {/* Logo / Initial monogram — no placeholder brand logos */}
          <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-2xl overflow-hidden bg-white flex items-center justify-center border-4 border-white/30">
            {distributor.showroom_logo_url ? (
              <img
                src={distributor.showroom_logo_url}
                alt={distributor.company_name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl font-black text-white"
                style={{ background: `linear-gradient(135deg, ${S}, ${S}99)` }}
              >
                {distributor.company_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Text block */}
          <div className="text-center md:text-left">
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: S + "25", color: S, border: `1px solid ${S}50` }}
            >
              <Shield className="h-3 w-3" /> Verified Marine Distributor
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
              {distributor.company_name}
            </h1>
            {distributor.showroom_tagline && (
              <p className="mt-3 text-lg md:text-xl max-w-2xl" style={{ color: "rgba(255,255,255,0.82)" }}>
                {distributor.showroom_tagline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. STATS BAR ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-3">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {distributor.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: S }} />
                <span className="text-sm font-semibold text-gray-700">{distributor.location}</span>
              </div>
            )}
            {(distributor.coverage_areas || []).length > 0 && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" style={{ color: S }} />
                <span className="text-sm font-semibold text-gray-700">
                  {(distributor.coverage_areas || []).length} Region
                  {(distributor.coverage_areas || []).length !== 1 ? "s" : ""} Covered
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0" style={{ color: S }} />
              <span className="text-sm font-semibold text-gray-700">
                {products.length} Product{products.length !== 1 ? "s" : ""} in Range
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 shrink-0" style={{ color: S }} />
              <span className="text-sm font-semibold text-gray-700">Approved Distributor</span>
            </div>
            {distributor.website_url && (
              <a
                href={distributor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-bold ml-auto transition-opacity hover:opacity-75"
                style={{ color: P }}
              >
                <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container py-12 space-y-14">

        {/* ── 3. ABOUT + CONTACT ──────────────────────────────────────────────── */}
        {(distributor.about_text || distributor.contact_email) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* About */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: S }} />
                <h2 className="text-2xl font-black" style={{ color: P }}>About Us</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                {distributor.about_text ||
                  "We are a specialised marine distributor serving our region with premium products from world-class vendors."}
              </p>
              {(distributor.specializations || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {(distributor.specializations || []).map((s: string) => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1.5 rounded-full border-2 font-semibold"
                      style={{ borderColor: P, color: P }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contact card — navy gradient, matches vendor showroom style */}
            <div
              className="rounded-2xl p-6 shadow-xl text-white"
              style={{ background: `linear-gradient(160deg, ${P} 0%, #0d2347 100%)` }}
            >
              <h3 className="text-lg font-black mb-5" style={{ color: S }}>Get in Touch</h3>
              <div className="space-y-3">
                {distributor.contact_email && (
                  <a
                    href={`mailto:${distributor.contact_email}`}
                    className="flex items-center gap-3 text-white/85 hover:text-white transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: S + "30" }}
                    >
                      <Mail className="h-4 w-4" style={{ color: S }} />
                    </div>
                    <span className="text-sm break-all">{distributor.contact_email}</span>
                  </a>
                )}
                {distributor.contact_phone && (
                  <a
                    href={`tel:${distributor.contact_phone}`}
                    className="flex items-center gap-3 text-white/85 hover:text-white transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: S + "30" }}
                    >
                      <Phone className="h-4 w-4" style={{ color: S }} />
                    </div>
                    <span className="text-sm">{distributor.contact_phone}</span>
                  </a>
                )}
                {distributor.website_url && (
                  <a
                    href={distributor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/85 hover:text-white transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: S + "30" }}
                    >
                      <Globe className="h-4 w-4" style={{ color: S }} />
                    </div>
                    <span className="text-sm">Website</span>
                    <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                  </a>
                )}
              </div>

              {(distributor.instagram_url || distributor.linkedin_url) && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Follow Us</p>
                  <div className="flex gap-2">
                    {distributor.instagram_url && (
                      <a
                        href={distributor.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: S }}
                      >
                        <Instagram className="h-4 w-4 text-white" />
                      </a>
                    )}
                    {distributor.linkedin_url && (
                      <a
                        href={distributor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: S }}
                      >
                        <Linkedin className="h-4 w-4 text-white" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setEnquiryOpen(true);
                  setTimeout(
                    () => document.getElementById("enquiry-section")?.scrollIntoView({ behavior: "smooth" }),
                    100
                  );
                }}
                className="mt-5 w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: S, color: "#fff" }}
              >
                <MessageSquare className="h-4 w-4" /> Send an Enquiry
              </button>
            </div>
          </div>
        )}

        {/* ── 4. PRODUCTS IN RANGE ────────────────────────────────────────────── */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: S }} />
              <h2 className="text-2xl font-black" style={{ color: P }}>
                Products in Range{" "}
                <span className="text-gray-400 font-normal text-lg">({products.length})</span>
              </h2>
            </div>

            {/* Category filter tabs */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat: string) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border"
                    style={
                      activeCategory === cat
                        ? { backgroundColor: P, color: "#fff", borderColor: P }
                        : { backgroundColor: "#fff", color: "#374151", borderColor: "#E5E7EB" }
                    }
                  >
                    {cat === "all" ? "All Products" : getProductCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Product image */}
                  <div className="aspect-square overflow-hidden relative bg-gray-50">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${P}12, ${S}12)` }}
                      >
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {product.domain_category && (
                      <span
                        className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow"
                        style={{ backgroundColor: P }}
                      >
                        {getProductCategoryLabel(product.domain_category)}
                      </span>
                    )}
                    {product.pricing_type === "coming_soon" && (
                      <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-white shadow">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-black" style={{ color: P }}>
                        {product.pricing_type === "poa"
                          ? "Price on Application"
                          : product.pricing_type === "contact_us"
                          ? "Contact Us"
                          : product.pricing_type === "coming_soon"
                          ? "Coming Soon"
                          : product.price > 0
                          ? `${product.currency || "GBP"} ${Number(product.price).toLocaleString()}`
                          : "Price on request"}
                      </p>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: S + "20" }}
                      >
                        <ArrowRight className="h-3.5 w-3.5" style={{ color: S }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. WHERE WE OPERATE ──────────────────────────────────────────────── */}
        {(distributor.coverage_areas || []).length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: S }} />
              <h2 className="text-2xl font-black" style={{ color: P }}>Where We Operate</h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <p className="text-gray-500 mb-5 text-sm">
                We can source and deliver marine equipment to the following regions. If your area isn't
                listed, get in touch — we may still be able to help.
              </p>
              <div className="flex flex-wrap gap-2">
                {(distributor.coverage_areas || []).map((area: string) => (
                  <span
                    key={area}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-white border-2 shadow-sm transition-colors hover:text-white"
                    style={{ borderColor: P + "60", color: P }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = P;
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fff";
                      e.currentTarget.style.color = P;
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 6. ENQUIRY CTA + FORM ───────────────────────────────────────────── */}
        <div id="enquiry-section">
          {/* CTA banner */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: `linear-gradient(120deg, ${P} 0%, #0d2347 60%, #1a3a6a 100%)` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: S }} />
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                  Need something for your vessel?
                </h2>
                <p className="max-w-lg text-sm md:text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
                  For quotes, bulk orders, or technical questions — send us an enquiry and we'll get
                  back to you within one business day.
                </p>
              </div>
              {!enquiryOpen && !enquirySent && (
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="shrink-0 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: S, color: "#fff" }}
                >
                  <Send className="h-4 w-4" /> Send an Enquiry
                </button>
              )}
            </div>
          </div>

          {/* Success state */}
          {enquirySent ? (
            <div
              className="mt-6 rounded-2xl bg-white border-2 p-10 text-center shadow-sm"
              style={{ borderColor: S }}
            >
              <CheckCircle2 className="mx-auto h-14 w-14 mb-4" style={{ color: S }} />
              <h3 className="text-xl font-black mb-2" style={{ color: P }}>Enquiry Sent!</h3>
              <p className="text-gray-500 mb-6">
                Thank you. {distributor.company_name} will be in touch shortly.
              </p>
              <button
                onClick={() => { setEnquirySent(false); setEnquiryOpen(false); }}
                className="text-sm font-semibold underline"
                style={{ color: P }}
              >
                Send another enquiry
              </button>
            </div>
          ) : enquiryOpen ? (
            <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-black mb-6" style={{ color: P }}>
                Contact {distributor.company_name}
              </h3>
              <form onSubmit={handleEnquiry} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={enquiry.name}
                      onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7700 000000"
                    value={enquiry.phone}
                    onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us what you need, where it needs to be delivered, or any technical questions..."
                    value={enquiry.message}
                    onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={enquiryLoading}
                    className="px-8 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ backgroundColor: P }}
                  >
                    {enquiryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {enquiryLoading ? "Sending..." : "Send Enquiry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnquiryOpen(false)}
                    className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── 7. FOOTER ───────────────────────────────────────────────────────── */}
      <div className="mt-12 border-t border-gray-200 bg-white">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {distributor.showroom_logo_url ? (
              <img
                src={distributor.showroom_logo_url}
                alt={distributor.company_name}
                className="h-7 w-auto object-contain"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-black"
                style={{ backgroundColor: P }}
              >
                {distributor.company_name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-gray-800 text-sm">{distributor.company_name}</span>
            <span className="text-gray-400 text-xs">· Approved Ocean Hotspot Distributor</span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {distributor.instagram_url && (
              <a
                href={distributor.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 transition-all"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = ""; }}
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {distributor.linkedin_url && (
              <a
                href={distributor.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 transition-all"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = ""; }}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {distributor.website_url && (
              <a
                href={distributor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 transition-all"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = ""; }}
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-gray-600">Ocean Hotspot</span>
          </p>
        </div>
      </div>

    </div>
  );
}

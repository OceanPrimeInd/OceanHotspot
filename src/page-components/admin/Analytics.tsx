// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAdminNavItems } from "@/config/adminNavItems";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, MessageSquare, TrendingUp, Store, Package,
  ArrowUpRight, BarChart2, ShoppingCart, Users, Wifi, Eye, Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Kpis {
  totalEnquiries: number;
  enquiriesThisMonth: number;
  enquiriesLastMonth: number;
  totalOrders: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  activeVendors: number;
  newVendorsThisMonth: number;
  publishedProducts: number;
  publishedShowrooms: number;
  highValueEnquiries: number;
}

type Range = "daily" | "weekly" | "monthly";

const CHART_PALETTE = ["#1e3a8a", "#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#6b7280", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card shadow-lg p-3 text-sm min-w-37.5">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground ml-auto">
            {entry.name.toLowerCase().includes("revenue") || entry.name.toLowerCase().includes("£")
              ? `£${Number(entry.value).toLocaleString()}`
              : Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthLabel(date: Date) {
  return date.toLocaleString("default", { month: "short", year: "2-digit" });
}

function getDayLabel(date: Date) {
  return date.toLocaleString("default", { weekday: "short", day: "numeric" });
}

function getWeekLabel(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  return `${day} ${month}`;
}

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round(((a - b) / b) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────

const AdminAnalytics = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const router = useRouter();
  const [range, setRange] = useState<Range>("monthly");
  const [loadingData, setLoadingData] = useState(true);

  // State
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topShowrooms, setTopShowrooms] = useState<any[]>([]);
  const [categoryPerf, setCategoryPerf] = useState<any[]>([]);
  const [enquiryByValue, setEnquiryByValue] = useState<any[]>([]);
  const [vendorSignupTrend, setVendorSignupTrend] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [trafficKpis, setTrafficKpis] = useState({ totalViews: 0, uniqueSessions: 0, viewsThisMonth: 0, viewsLastMonth: 0 });
  const [topPages, setTopPages] = useState<any[]>([]);
  const [trafficTrend, setTrafficTrend] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [topSearches, setTopSearches] = useState<{ query: string; count: number }[]>([]);
  const [checkoutFunnel, setCheckoutFunnel] = useState<{ stage: string; count: number }[]>([]);

  const buildTrend = useCallback((
    enquiries: any[],
    orders: any[],
    rangeType: Range,
  ) => {
    const now = new Date();
    const points: any[] = [];

    if (rangeType === "daily") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        const label = getDayLabel(d);
        const enqs = enquiries.filter(e => {
          const t = new Date(e.created_at); return t >= d && t < nextD;
        }).length;
        const ords = orders.filter(o => {
          const t = new Date(o.created_at); return t >= d && t < nextD;
        }).length;
        const rev = orders.filter(o => {
          const t = new Date(o.created_at); return t >= d && t < nextD;
        }).reduce((s, o) => s + (o.total_amount || 0), 0);
        points.push({ label, enquiries: enqs, orders: ords, revenue: Math.round(rev) });
      }
    } else if (rangeType === "weekly") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i * 7 - now.getDay());
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 7);
        const label = getWeekLabel(d);
        const enqs = enquiries.filter(e => {
          const t = new Date(e.created_at); return t >= d && t < nextD;
        }).length;
        const ords = orders.filter(o => {
          const t = new Date(o.created_at); return t >= d && t < nextD;
        }).length;
        const rev = orders.filter(o => {
          const t = new Date(o.created_at); return t >= d && t < nextD;
        }).reduce((s, o) => s + (o.total_amount || 0), 0);
        points.push({ label, enquiries: enqs, orders: ords, revenue: Math.round(rev) });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const label = getMonthLabel(d);
        const enqs = enquiries.filter(e => {
          const t = new Date(e.created_at); return t >= d && t < nextD;
        }).length;
        const ords = orders.filter(o => {
          const t = new Date(o.created_at); return t >= d && t < nextD;
        }).length;
        const rev = orders.filter(o => {
          const t = new Date(o.created_at); return t >= d && t < nextD;
        }).reduce((s, o) => s + (o.total_amount || 0), 0);
        points.push({ label, enquiries: enqs, orders: ords, revenue: Math.round(rev) });
      }
    }
    return points;
  }, []);

  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    const now = new Date();
    const startThisMonth  = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo    = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      { data: allEnquiries },
      { data: allOrders },
      { data: allProfiles },
      { data: allProducts },
      { data: allShowrooms },
      { data: allPageViews },
    ] = await Promise.all([
      supabase.from("enquiries").select("id, created_at, product_id").gte("created_at", sixMonthsAgo.toISOString()),
      supabase.from("orders").select("id, total_amount, status, payment_status, created_at, seller_id").gte("created_at", sixMonthsAgo.toISOString()),
      supabase.from("profiles").select("id, company_name, created_at, is_seller").eq("is_seller", true),
      supabase.from("products").select("id, title, domain_category, price, seller_id, status").or("is_published.eq.true,status.eq.active"),
      supabase.from("showrooms").select("id, seller_id, brand_name, slug, is_published"),
      (supabase.from("page_views" as any) as any).select("id, path, session_id, referrer, created_at").gte("created_at", sixMonthsAgo.toISOString()),
    ]);

    const enquiries  = allEnquiries  || [];
    const orders     = allOrders     || [];
    const profiles   = allProfiles   || [];
    const products   = allProducts   || [];
    const showrooms  = allShowrooms  || [];

    // ── KPIs ──────────────────────────────────────────────────────────────────
    const enqThisMonth  = enquiries.filter(e => new Date(e.created_at) >= startThisMonth);
    const enqLastMonth  = enquiries.filter(e => {
      const t = new Date(e.created_at);
      return t >= startLastMonth && t < startThisMonth;
    });
    const ordThisMonth  = orders.filter(o => new Date(o.created_at) >= startThisMonth);
    const revThisMonth  = ordThisMonth.reduce((s, o) => s + (o.total_amount || 0), 0);
    const newVendors    = profiles.filter(p => new Date(p.created_at) >= startThisMonth).length;

    // Product price map
    const productPriceMap: Record<string, number> = {};
    products.forEach(p => { productPriceMap[p.id] = p.price || 0; });

    // High value enquiries (product price ≥ £500)
    const highValueEnqs = enquiries.filter(e => (productPriceMap[e.product_id] || 0) >= 500).length;

    setKpis({
      totalEnquiries:      enquiries.length,
      enquiriesThisMonth:  enqThisMonth.length,
      enquiriesLastMonth:  enqLastMonth.length,
      totalOrders:         orders.length,
      ordersThisMonth:     ordThisMonth.length,
      revenueThisMonth:    Math.round(revThisMonth),
      activeVendors:       profiles.length,
      newVendorsThisMonth: newVendors,
      publishedProducts:   products.length,
      publishedShowrooms:  showrooms.filter(s => s.is_published).length,
      highValueEnquiries:  highValueEnqs,
    });

    // ── Trend Chart ───────────────────────────────────────────────────────────
    setTrendData(buildTrend(enquiries, orders, range));

    // ── Top Products by Enquiries ──────────────────────────────────────────────
    const enqByProduct: Record<string, number> = {};
    enquiries.forEach(e => {
      if (e.product_id) enqByProduct[e.product_id] = (enqByProduct[e.product_id] || 0) + 1;
    });
    const topProds = products
      .map(p => ({ name: p.title.length > 36 ? p.title.slice(0, 34) + "…" : p.title, enquiries: enqByProduct[p.id] || 0, price: p.price }))
      .sort((a, b) => b.enquiries - a.enquiries)
      .slice(0, 6);
    setTopProducts(topProds);

    // ── Top Showrooms by Enquiries ─────────────────────────────────────────────
    const enqBySeller: Record<string, number> = {};
    products.forEach(p => {
      enqBySeller[p.seller_id] = (enqBySeller[p.seller_id] || 0) + (enqByProduct[p.id] || 0);
    });
    const productsBySeller: Record<string, number> = {};
    products.forEach(p => { productsBySeller[p.seller_id] = (productsBySeller[p.seller_id] || 0) + 1; });

    const topShowrms = showrooms
      .filter(s => s.is_published)
      .map(s => ({
        name: s.brand_name,
        enquiries: enqBySeller[s.seller_id] || 0,
        products: productsBySeller[s.seller_id] || 0,
      }))
      .sort((a, b) => b.enquiries - a.enquiries)
      .slice(0, 5);
    setTopShowrooms(topShowrms);

    // ── Category Performance ──────────────────────────────────────────────────
    const catMap: Record<string, number> = {};
    products.forEach(p => {
      if (p.domain_category) catMap[p.domain_category] = (catMap[p.domain_category] || 0) + 1;
    });
    const totalCat = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    const catData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count], i) => ({
        name: name.length > 18 ? name.slice(0, 16) + "…" : name,
        value: Math.round((count / totalCat) * 100),
        color: CHART_PALETTE[i] || "#6b7280",
      }));
    setCategoryPerf(catData);

    // ── Enquiries by Value ────────────────────────────────────────────────────
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    enquiries.forEach(e => {
      const price = productPriceMap[e.product_id] || 0;
      if (price < 500)   b0++;
      else if (price < 2000)  b1++;
      else if (price < 10000) b2++;
      else b3++;
    });
    setEnquiryByValue([
      { range: "< £500",    count: b0, color: "#6b7280" },
      { range: "£500–£2k",  count: b1, color: "#2563eb" },
      { range: "£2k–£10k",  count: b2, color: "#f59e0b" },
      { range: "£10k+",     count: b3, color: "#10b981" },
    ]);

    // ── Vendor Sign-up Trend ──────────────────────────────────────────────────
    const vendorTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      vendorTrend.push({
        month:   getMonthLabel(d),
        signups: profiles.filter(p => { const t = new Date(p.created_at); return t >= d && t < nextD; }).length,
      });
    }
    setVendorSignupTrend(vendorTrend);

    // ── Orders by Status ──────────────────────────────────────────────────────
    const statusMap: Record<string, number> = {};
    orders.forEach(o => { const s = o.status || "unknown"; statusMap[s] = (statusMap[s] || 0) + 1; });
    setOrdersByStatus(
      Object.entries(statusMap).map(([name, value], i) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        value,
        color: CHART_PALETTE[i] || "#6b7280",
      }))
    );

    setLoadingData(false);
  }, []); // eslint-disable-line

  // Re-build trend when range changes (without refetching Supabase)
  const [rawEnquiries, setRawEnquiries] = useState<any[]>([]);
  const [rawOrders, setRawOrders]       = useState<any[]>([]);

  const fetchAllWithStore = useCallback(async () => {
    setLoadingData(true);
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo   = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      { data: allEnquiries },
      { data: allOrders },
      { data: allProfiles },
      { data: allProducts },
      { data: allShowrooms },
      { data: allPageViews },
      { data: allAnalyticsEvents },
    ] = await Promise.all([
      supabase.from("enquiries").select("id, created_at, product_id").gte("created_at", sixMonthsAgo.toISOString()),
      supabase.from("orders").select("id, total_amount, status, payment_status, created_at, seller_id").gte("created_at", sixMonthsAgo.toISOString()),
      supabase.from("profiles").select("id, company_name, created_at, is_seller").eq("is_seller", true),
      supabase.from("products").select("id, title, domain_category, price, seller_id, status").or("is_published.eq.true,status.eq.active"),
      supabase.from("showrooms").select("id, seller_id, brand_name, slug, is_published"),
      (supabase.from("page_views" as any) as any).select("id, path, session_id, referrer, created_at").gte("created_at", sixMonthsAgo.toISOString()),
      (supabase.from("analytics_events" as any) as any).select("event_type, metadata, created_at").gte("created_at", sixMonthsAgo.toISOString()),
    ]);

    const enquiries  = allEnquiries  || [];
    const orders     = allOrders     || [];
    const profiles   = allProfiles   || [];
    const products   = allProducts   || [];
    const showrooms  = allShowrooms  || [];

    setRawEnquiries(enquiries);
    setRawOrders(orders);

    const enqThisMonth = enquiries.filter(e => new Date(e.created_at) >= startThisMonth);
    const enqLastMonth = enquiries.filter(e => {
      const t = new Date(e.created_at);
      return t >= startLastMonth && t < startThisMonth;
    });
    const ordThisMonth = orders.filter(o => new Date(o.created_at) >= startThisMonth);
    const revThisMonth = ordThisMonth.reduce((s, o) => s + (o.total_amount || 0), 0);
    const newVendors   = profiles.filter(p => new Date(p.created_at) >= startThisMonth).length;

    const productPriceMap: Record<string, number> = {};
    products.forEach(p => { productPriceMap[p.id] = p.price || 0; });
    const highValueEnqs = enquiries.filter(e => (productPriceMap[e.product_id] || 0) >= 500).length;

    setKpis({
      totalEnquiries:      enquiries.length,
      enquiriesThisMonth:  enqThisMonth.length,
      enquiriesLastMonth:  enqLastMonth.length,
      totalOrders:         orders.length,
      ordersThisMonth:     ordThisMonth.length,
      revenueThisMonth:    Math.round(revThisMonth),
      activeVendors:       profiles.length,
      newVendorsThisMonth: newVendors,
      publishedProducts:   products.length,
      publishedShowrooms:  showrooms.filter(s => s.is_published).length,
      highValueEnquiries:  highValueEnqs,
    });

    setTrendData(buildTrend(enquiries, orders, range));

    const enqByProduct: Record<string, number> = {};
    enquiries.forEach(e => { if (e.product_id) enqByProduct[e.product_id] = (enqByProduct[e.product_id] || 0) + 1; });

    setTopProducts(
      products
        .map(p => ({ name: p.title.length > 36 ? p.title.slice(0, 34) + "…" : p.title, enquiries: enqByProduct[p.id] || 0, price: p.price }))
        .sort((a, b) => b.enquiries - a.enquiries)
        .slice(0, 6)
    );

    const enqBySeller: Record<string, number> = {};
    products.forEach(p => { enqBySeller[p.seller_id] = (enqBySeller[p.seller_id] || 0) + (enqByProduct[p.id] || 0); });
    const productsBySeller: Record<string, number> = {};
    products.forEach(p => { productsBySeller[p.seller_id] = (productsBySeller[p.seller_id] || 0) + 1; });

    setTopShowrooms(
      showrooms
        .filter(s => s.is_published)
        .map(s => ({ name: s.brand_name, enquiries: enqBySeller[s.seller_id] || 0, products: productsBySeller[s.seller_id] || 0 }))
        .sort((a, b) => b.enquiries - a.enquiries)
        .slice(0, 5)
    );

    const catMap: Record<string, number> = {};
    products.forEach(p => { if (p.domain_category) catMap[p.domain_category] = (catMap[p.domain_category] || 0) + 1; });
    const totalCat = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    setCategoryPerf(
      Object.entries(catMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 7)
        .map(([name, count], i) => ({
          name: name.length > 18 ? name.slice(0, 16) + "…" : name,
          value: Math.round((count / totalCat) * 100),
          color: CHART_PALETTE[i] || "#6b7280",
        }))
    );

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    enquiries.forEach(e => {
      const price = productPriceMap[e.product_id] || 0;
      if (price < 500) b0++; else if (price < 2000) b1++; else if (price < 10000) b2++; else b3++;
    });
    setEnquiryByValue([
      { range: "< £500",   count: b0, color: "#6b7280" },
      { range: "£500–£2k", count: b1, color: "#2563eb" },
      { range: "£2k–£10k", count: b2, color: "#f59e0b" },
      { range: "£10k+",    count: b3, color: "#10b981" },
    ]);

    const vendorTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      vendorTrend.push({
        month:   getMonthLabel(d),
        signups: profiles.filter(p => { const t = new Date(p.created_at); return t >= d && t < nextD; }).length,
      });
    }
    setVendorSignupTrend(vendorTrend);

    const statusMap: Record<string, number> = {};
    orders.forEach(o => { const s = o.status || "unknown"; statusMap[s] = (statusMap[s] || 0) + 1; });
    setOrdersByStatus(
      Object.entries(statusMap).map(([name, value], i) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        value,
        color: CHART_PALETTE[i] || "#6b7280",
      }))
    );

    // ── Traffic / Page Views ──────────────────────────────────────────────────
    const pageViews = allPageViews || [];
    const viewsThisMonth = pageViews.filter(v => new Date(v.created_at) >= startThisMonth).length;
    const viewsLastMonth = pageViews.filter(v => {
      const t = new Date(v.created_at); return t >= startLastMonth && t < startThisMonth;
    }).length;
    const uniqueSessions = new Set(pageViews.map(v => v.session_id).filter(Boolean)).size;
    setTrafficKpis({ totalViews: pageViews.length, uniqueSessions, viewsThisMonth, viewsLastMonth });

    const pageMap: Record<string, number> = {};
    pageViews.forEach(v => { pageMap[v.path] = (pageMap[v.path] || 0) + 1; });
    setTopPages(
      Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([path, views]) => ({ path, views }))
    );

    const trafficTrendData = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthViews = pageViews.filter(v => { const t = new Date(v.created_at); return t >= d && t < nextD; });
      trafficTrendData.push({
        month: getMonthLabel(d),
        views: monthViews.length,
        sessions: new Set(monthViews.map(v => v.session_id)).size,
      });
    }
    setTrafficTrend(trafficTrendData);

    const refMap: Record<string, number> = {};
    pageViews.forEach(v => { const ref = v.referrer || "Direct"; refMap[ref] = (refMap[ref] || 0) + 1; });
    setReferrers(
      Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([name, value], i) => ({ name, value, color: CHART_PALETTE[i] || "#6b7280" }))
    );

    const events = allAnalyticsEvents || [];
    const searchMap: Record<string, number> = {};
    events
      .filter((e: { event_type: string }) => e.event_type === "search")
      .forEach((e: { metadata?: { query?: string } }) => {
        const q = (e.metadata?.query || "").trim().toLowerCase();
        if (q) searchMap[q] = (searchMap[q] || 0) + 1;
      });
    setTopSearches(
      Object.entries(searchMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count })),
    );

    const funnelTypes = ["checkout_view", "checkout_start", "checkout_complete", "checkout_abandon"] as const;
    const funnelLabels: Record<string, string> = {
      checkout_view: "Checkout page views",
      checkout_start: "Pay with Stripe clicked",
      checkout_complete: "Orders completed",
      checkout_abandon: "Left checkout (estimate)",
    };
    setCheckoutFunnel(
      funnelTypes.map((t) => ({
        stage: funnelLabels[t] || t,
        count: events.filter((e: { event_type: string }) => e.event_type === t).length,
      })),
    );

    setLoadingData(false);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!adminLoading && !isAdmin) { router.push("/admin/login"); return; }
    if (isAdmin) fetchAllWithStore();
  }, [isAdmin, adminLoading]); // eslint-disable-line

  // Re-compute trend chart when range changes (no extra DB call)
  useEffect(() => {
    if (rawEnquiries.length > 0 || rawOrders.length > 0) {
      setTrendData(buildTrend(rawEnquiries, rawOrders, range));
    }
  }, [range, buildTrend, rawEnquiries, rawOrders]);

  const navItems = getAdminNavItems();
  const enquiryMoM = kpis ? pct(kpis.enquiriesThisMonth, kpis.enquiriesLastMonth) : 0;

  if (adminLoading || loadingData) {
    return (
      <DashboardLayout sidebarItems={navItems} sidebarTitle="Ocean Hotspot Admin">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading real-time data…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Ocean Hotspot Admin">
      <div className="p-6 lg:p-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              Marketing & Sales Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Live data from your Supabase database</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 self-start">
            {(["daily", "weekly", "monthly"] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  range === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Enquiries This Month"
            value={kpis?.enquiriesThisMonth ?? 0}
            subtitle={`${kpis?.totalEnquiries ?? 0} total (6 months)`}
            icon={MessageSquare}
            variant="warning"
            trend={kpis?.enquiriesLastMonth ? { value: Math.abs(enquiryMoM), isPositive: enquiryMoM >= 0 } : undefined}
          />
          <StatCard
            title="Orders This Month"
            value={kpis?.ordersThisMonth ?? 0}
            subtitle={`£${(kpis?.revenueThisMonth ?? 0).toLocaleString()} revenue`}
            icon={ShoppingCart}
            variant="primary"
          />
          <StatCard
            title="Active Vendors"
            value={kpis?.activeVendors ?? 0}
            subtitle={`${kpis?.newVendorsThisMonth ?? 0} new this month`}
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Published Products"
            value={kpis?.publishedProducts ?? 0}
            subtitle={`${kpis?.publishedShowrooms ?? 0} live showrooms`}
            icon={Package}
            variant="default"
          />
        </div>

        {/* ── Trend Chart ── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-semibold text-foreground">Enquiries & Orders Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real data from your database — switch range above</p>
            </div>
            <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs flex items-center gap-1">
              <Wifi className="h-3 w-3" /> Live
            </Badge>
          </div>
          <div className="mt-5">
            {trendData.every(d => d.enquiries === 0 && d.orders === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                No enquiries or orders in this period yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEnq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="enquiries" name="Enquiries" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gEnq)" />
                  <Area type="monotone" dataKey="orders"    name="Orders"    stroke="#2563eb" strokeWidth={2.5} fill="url(#gOrd)" />
                  <Line  type="monotone" dataKey="revenue"   name="Revenue £"  stroke="#10b981" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Top Products + Top Showrooms ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-0.5">
              <Package className="h-4 w-4 text-primary" /> Most Enquired Products
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Ranked by total enquiries received</p>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No products with enquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="h-3 w-3" />{p.enquiries} enquiries</span>
                        {p.price > 0 && <span className="text-xs text-primary font-medium">£{p.price.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                      <div className="h-full bg-primary rounded-full" style={{ width: topProducts[0]?.enquiries > 0 ? `${(p.enquiries / topProducts[0].enquiries) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-0.5">
              <Store className="h-4 w-4 text-primary" /> Top Showrooms
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Ranked by enquiries across all their products</p>
            {topShowrooms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No published showrooms yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topShowrooms} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="enquiries" name="Enquiries" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="products"  name="Products"  fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Categories + Enquiry Value + Orders ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-0.5">Best Categories</h2>
            <p className="text-xs text-muted-foreground mb-3">Share of published products by category</p>
            {categoryPerf.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No products yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryPerf} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                      {categoryPerf.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {categoryPerf.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-muted-foreground truncate max-w-30">{s.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-0.5">Enquiries by Item Value</h2>
            <p className="text-xs text-muted-foreground mb-4">Based on product prices at time of enquiry</p>
            {enquiryByValue.every(e => e.count === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">No enquiries yet.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {enquiryByValue.map((e, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">{e.range}</span>
                        <span className="font-bold text-foreground">{e.count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: Math.max(...enquiryByValue.map(x => x.count)) > 0
                            ? `${(e.count / Math.max(...enquiryByValue.map(x => x.count))) * 100}%`
                            : "0%",
                          background: e.color,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <span className="font-semibold">{kpis?.highValueEnquiries ?? 0} high-value enquiries</span> (£500+) — escrow/bank transfer triggered
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-0.5">Orders by Status</h2>
            <p className="text-xs text-muted-foreground mb-3">Last 6 months — all order types</p>
            {ordersByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                      {ordersByStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {ordersByStatus.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Traffic KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Page Views This Month"
            value={trafficKpis.viewsThisMonth.toLocaleString()}
            subtitle={`${trafficKpis.totalViews.toLocaleString()} total (6 months)`}
            icon={Eye}
            variant="primary"
            trend={trafficKpis.viewsLastMonth > 0 ? { value: Math.abs(pct(trafficKpis.viewsThisMonth, trafficKpis.viewsLastMonth)), isPositive: trafficKpis.viewsThisMonth >= trafficKpis.viewsLastMonth } : undefined}
          />
          <StatCard title="Unique Sessions" value={trafficKpis.uniqueSessions.toLocaleString()} subtitle="Distinct visitors (6 months)" icon={Users} variant="success" />
          <StatCard title="Most Visited Page" value={topPages[0]?.path ?? "—"} subtitle={topPages[0] ? `${topPages[0].views} views` : "No data yet"} icon={TrendingUp} variant="default" />
          <StatCard title="Total Page Views" value={trafficKpis.totalViews.toLocaleString()} subtitle="Last 6 months" icon={BarChart2} variant="default" />
        </div>

        {/* ── Traffic Trend + Referrers ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Page Views Over Time</h2>
              <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs flex items-center gap-1"><Wifi className="h-3 w-3" /> Live</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Monthly views and unique sessions from your built-in tracker</p>
            {trafficTrend.every(d => d.views === 0) ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">Browse your site to start collecting data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trafficTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="views"    name="Page Views"      stroke="#2563eb" strokeWidth={2} fill="url(#gViews)" />
                  <Line type="monotone" dataKey="sessions" name="Unique Sessions"  stroke="#10b981" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-0.5">Traffic Sources</h2>
            <p className="text-xs text-muted-foreground mb-3">Where your visitors come from (referrer domain)</p>
            {referrers.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">No referrer data yet.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={referrers} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                      {referrers.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {referrers.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Search + checkout funnel ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-0.5">Top site searches</h2>
            <p className="text-xs text-muted-foreground mb-4">Requires analytics cookie consent</p>
            {topSearches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No search events yet.</p>
            ) : (
              <ul className="space-y-2">
                {topSearches.map((s) => (
                  <li key={s.query} className="flex justify-between text-sm">
                    <span className="truncate font-mono">{s.query}</span>
                    <span className="font-semibold shrink-0 ml-2">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-0.5">Checkout funnel (6 months)</h2>
            <p className="text-xs text-muted-foreground mb-4">View → start Stripe → complete / abandon</p>
            <ul className="space-y-2">
              {checkoutFunnel.map((row) => (
                <li key={row.stage} className="flex justify-between text-sm">
                  <span>{row.stage}</span>
                  <span className="font-semibold">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Vendor Sign-ups + Top Pages ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-base font-semibold text-foreground">Vendor Sign-ups Over Time</h2>
              {(kpis?.newVendorsThisMonth ?? 0) > 0 && (
                <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">
                  +{kpis?.newVendorsThisMonth} this month
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">New seller accounts by month</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={vendorSignupTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="signups" name="Sign-ups" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                [kpis?.activeVendors ?? 0, "Total Vendors"],
                [kpis?.newVendorsThisMonth ?? 0, "New This Month"],
                [kpis?.publishedShowrooms ?? 0, "Live Showrooms"],
              ].map(([v, l]) => (
                <div key={String(l)} className="rounded-lg bg-muted/50 border border-border p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{v}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic: Top Pages */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-0.5">
              <Eye className="h-4 w-4 text-primary" /> Most Visited Pages
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {trafficKpis.totalViews > 0
                ? `${trafficKpis.viewsThisMonth.toLocaleString()} views this month · ${trafficKpis.uniqueSessions.toLocaleString()} unique sessions`
                : "Start generating data — visit your site to begin tracking"}
            </p>
            {topPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm text-center gap-2">
                <Eye className="h-10 w-10 opacity-30" />
                <p>No page views recorded yet.</p>
                <p className="text-xs">Browse your site — views will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topPages.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate font-mono">{p.path}</p>
                    </div>
                    <span className="text-xs font-bold text-foreground shrink-0">{p.views.toLocaleString()}</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                      <div className="h-full bg-primary rounded-full" style={{ width: topPages[0]?.views > 0 ? `${(p.views / topPages[0].views) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;

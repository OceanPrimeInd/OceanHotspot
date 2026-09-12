// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import { ContactEmailLink } from "@/components/ContactEmailLink";
import {
  Loader2,
  Package,
  ShoppingCart,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Building2,
  Zap,
  Store,
  Anchor,
} from "lucide-react";

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Vendor Notified",
  shipped: "Shipped to Distributor",
  completed: "Delivered to Customer",
  cancelled: "Cancelled",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

interface Distributor {
  id: string;
  company_name: string;
  status: string;
  commission_rate: number;
  coverage_areas: string[];
  specializations: string[];
  location: string | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-sm font-medium">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
  );
}

export default function DistributorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalCommission: 0,
    vendorsRepresented: 0,
    productsRepresented: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [growthTriggers, setGrowthTriggers] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/dashboard");
      return;
    }
    if (!authLoading && user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch distributor profile
      const { data: dist, error: distError } = await supabase
        .from("distributors")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (distError) throw distError;

      if (!dist) {
        router.push("/distributor/register");
        return;
      }

      setDistributor(dist);

      // Fetch stats in parallel
      const [ordersRes, portRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total_amount, distributor_commission, status, created_at, products(title)")
          .eq("distributor_id", dist.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("distributor_products")
          .select("id, seller_id, product_id, status")
          .eq("distributor_id", dist.id)
          .eq("status", "active"),
      ]);

      const orders = ordersRes.data || [];
      const portfolio = portRes.data || [];

      const uniqueSellers = new Set(portfolio.map(p => p.seller_id));

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === "pending" || o.status === "processing").length,
        totalCommission: orders.reduce((sum, o) => sum + (o.distributor_commission || 0), 0),
        vendorsRepresented: uniqueSellers.size,
        productsRepresented: portfolio.length,
      });

      setRecentOrders(orders.slice(0, 5));

      // Growth triggers: products with ≥5 sales through this distributor
      const salesCount = new Map<string, { count: number; title: string }>();
      orders.forEach(o => {
        if (o.products?.title) {
          const key = o.product_id || o.products.title;
          const existing = salesCount.get(key) || { count: 0, title: o.products.title };
          salesCount.set(key, { count: existing.count + 1, title: o.products.title });
        }
      });
      const triggers = Array.from(salesCount.entries())
        .filter(([, v]) => v.count >= 5)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setGrowthTriggers(triggers);

      // Persist growth_trigger_reached flag to DB for any products hitting ≥5 sales
      if (triggers.length > 0) {
        const triggerProductIds = triggers.map(t => t.id).filter(id => id.length === 36); // uuid check
        if (triggerProductIds.length > 0) {
          await supabase
            .from("distributor_products")
            .update({ growth_trigger_reached: true })
            .eq("distributor_id", dist.id)
            .in("product_id", triggerProductIds)
            .eq("growth_trigger_reached", false); // only update rows not already flagged
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navItems = getDistributorNavItems({ orders: stats.pendingOrders });

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getDistributorNavItems()} sidebarTitle="Distributor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!distributor) return null;

  const isPending = distributor.status === "pending";
  const isSuspended = distributor.status === "suspended";

  return (
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Distributor">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Status Banner */}
        {isPending && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">Application Under Review</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                Our team is reviewing your distributor application. You'll receive an email within 2–3 business days.
              </p>
            </div>
          </div>
        )}
        {isSuspended && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">Account Suspended</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                Please contact support at <ContactEmailLink className="text-red-700 dark:text-red-400 underline" /> to resolve this.
              </p>
            </div>
          </div>
        )}

        {/* Hero header strip */}
        <div className="relative overflow-hidden rounded-2xl mb-8 bg-[#0B1F3B]">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10 bg-amber-400" />
          <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full opacity-10 bg-amber-400" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
          <div className="relative px-6 py-6 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Anchor className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Distributor Dashboard
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {distributor.company_name}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {distributor.location && (
                  <span className="text-sm text-white/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {distributor.location}
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  distributor.status === "approved"
                    ? "bg-green-400/20 text-green-300 border border-green-400/30"
                    : distributor.status === "pending"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-red-400/20 text-red-300 border border-red-400/30"
                }`}>
                  {distributor.status === "approved" ? "✓ Active"
                    : distributor.status === "pending" ? "Under Review"
                    : "Suspended"}
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 border-white/20 text-white hover:bg-white/10">
              <Link href="/distributor/profile">Edit Profile</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="all time"
            icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="Money Earned"
            value={`£${stats.totalCommission.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
            subtitle="all time"
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            color="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            title="Brands You Sell For"
            value={stats.vendorsRepresented}
            subtitle="you represent these"
            icon={<Building2 className="w-5 h-5 text-purple-600" />}
            color="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            title="Products Listed"
            value={stats.productsRepresented}
            subtitle="in your range"
            icon={<Package className="w-5 h-5 text-amber-600" />}
            color="bg-amber-100 dark:bg-amber-900/30"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="md:col-span-2 bg-card border rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold">Recent Orders</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/distributor/orders">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No orders yet. Orders facilitated through your network will appear here.
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium truncate max-w-45">
                        {order.products?.title || "Order"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +£{(order.distributor_commission || 0).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ORDER_STATUS_COLORS[order.status] || "bg-muted text-muted-foreground"
                      }`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coverage & Quick Actions */}
          <div className="space-y-4">
            <div className="bg-card border rounded-xl p-5">
              <h2 className="font-semibold mb-3">Your Areas</h2>
              <div className="flex flex-wrap gap-1.5">
                {distributor.coverage_areas.map(area => (
                  <span key={area} className="text-xs bg-[#0B1F3B]/10 text-[#0B1F3B] dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
              <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                <Link href="/distributor/coverage">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Coverage Map
                </Link>
              </Button>
            </div>

            <div className="bg-card border rounded-xl p-5">
              <h2 className="font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Button asChild className="w-full bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white">
                  <Link href="/distributor/products">Browse Products</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/distributor/orders">View All Orders</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/distributor/earnings">Earnings Report</Link>
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Your Earnings Rate</p>
              <p className="text-3xl font-bold text-amber-600">{distributor.commission_rate}%</p>
              <p className="text-amber-700 dark:text-amber-400 mt-1">Of each completed order</p>
            </div>

            <div className="bg-card border rounded-xl p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-[#0B1F3B]" />
                My Shop Page
              </h2>
              <p className="text-xs text-muted-foreground mb-3">Your public page where customers can find and contact you.</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/distributor/showroom">Manage Showroom</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Growth Trigger Alerts */}
        {growthTriggers.length > 0 && (
          <div className="mt-6 bg-linear-to-r from-[#0B1F3B]/5 to-amber-50 dark:from-[#0B1F3B]/20 dark:to-amber-900/10 border border-[#0B1F3B]/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[#0B1F3B] dark:text-white">Products Selling Well</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  These products have been ordered 5 or more times through you. You could earn more by stocking them locally.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {growthTriggers.map(trigger => (
                <div key={trigger.id} className="bg-white dark:bg-card border rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{trigger.title}</p>
                    <p className="text-xs text-amber-600 font-semibold">{trigger.count} orders — could you stock this?</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import { Loader2, Search, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

// Map internal DB status → display label for the distributor business model
const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  processing: "Vendor Notified",
  shipped: "Shipped to Distributor",
  completed: "Delivered to Customer",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function DistributorOrders() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/orders");
      return;
    }
    if (!authLoading && user) loadOrders();
  }, [user, authLoading]);

  const loadOrders = async () => {
    setLoading(true);
    const { data: dist } = await supabase
      .from("distributors")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!dist) { router.push("/distributor/register"); return; }

    const { data } = await supabase
      .from("orders")
      .select("*, products(title, image_url), profiles:buyer_id(full_name, email)")
      .eq("distributor_id", dist.id)
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.products?.title?.toLowerCase().includes(q) ||
        o.profiles?.full_name?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, orders]);

  const navItems = getDistributorNavItems();
  const pendingCount = orders.filter(o => o.status === "pending" || o.status === "processing").length;

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={navItems} sidebarTitle="Distributor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getDistributorNavItems({ orders: pendingCount })} sidebarTitle="Distributor">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Orders</h1>
        <p className="text-muted-foreground text-sm mb-6">Orders facilitated through your distributor network.</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product, buyer, or order ID..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "processing", "shipped", "completed", "cancelled"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? "bg-[#0B1F3B] text-white border-[#0B1F3B]"
                    : "border-border hover:border-[#0B1F3B]"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border rounded-xl py-16 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Orders for products in your portfolio will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Buyer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-green-600">Commission</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(order => (
                  <>
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium truncate max-w-[140px]">
                          {order.products?.title || "Order"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {order.profiles?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        £{Number(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        +£{Number(order.distributor_commission || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || ""}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {expandedId === order.id
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="px-4 py-3 bg-muted/20 text-sm">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Order Total</p>
                              <p className="font-semibold">£{Number(order.total_amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Your Commission</p>
                              <p className="font-semibold text-green-600">£{Number(order.distributor_commission || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Platform Fee</p>
                              <p className="font-semibold">£{Number(order.platform_fee || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Vendor Payout</p>
                              <p className="font-semibold">£{Number(order.seller_payout || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          {order.shipping_address && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Ship to:</span> {order.shipping_address}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

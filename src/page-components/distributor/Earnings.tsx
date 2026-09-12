// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import { Loader2, TrendingUp, DollarSign, Calendar, ArrowUpRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DistributorEarnings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [range, setRange] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/earnings");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const { data: dist } = await supabase
      .from("distributors")
      .select("id, commission_rate")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!dist) { router.push("/distributor/register"); return; }

    const { data } = await supabase
      .from("orders")
      .select("id, total_amount, distributor_commission, status, created_at")
      .eq("distributor_id", dist.id)
      .eq("status", "completed")
      .order("created_at", { ascending: true });

    setOrders(data || []);
    setLoading(false);
  };

  // Build chart data
  const chartData = (() => {
    const map = new Map<string, { label: string; commission: number; orders: number }>();
    orders.forEach(o => {
      const date = new Date(o.created_at);
      const key = range === "monthly"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : (() => {
            const d = new Date(date);
            d.setDate(d.getDate() - d.getDay());
            return d.toISOString().slice(0, 10);
          })();
      const label = range === "monthly"
        ? date.toLocaleString("en-GB", { month: "short", year: "2-digit" })
        : new Date(key).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const existing = map.get(key) || { label, commission: 0, orders: 0 };
      existing.commission += Number(o.distributor_commission || 0);
      existing.orders += 1;
      map.set(key, existing);
    });
    return Array.from(map.values());
  })();

  const totalEarned = orders.reduce((s, o) => s + Number(o.distributor_commission || 0), 0);
  const thisMonth = orders
    .filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, o) => s + Number(o.distributor_commission || 0), 0);
  const avgPerOrder = orders.length > 0 ? totalEarned / orders.length : 0;

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getDistributorNavItems()} sidebarTitle="Distributor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getDistributorNavItems()} sidebarTitle="Distributor">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Earnings Report</h1>
        <p className="text-muted-foreground text-sm mb-6">Commission earned from completed orders.</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Earned", value: `£${totalEarned.toFixed(2)}`, sub: "all completed orders", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
            { label: "This Month", value: `£${thisMonth.toFixed(2)}`, sub: "current month", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
            { label: "Avg per Order", value: `£${avgPerOrder.toFixed(2)}`, sub: `across ${orders.length} orders`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm font-medium mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Commission Over Time</h2>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {(["monthly", "weekly"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    range === r ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No completed orders yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `£${v}`} />
                <Tooltip formatter={(v: number) => [`£${v.toFixed(2)}`, "Commission"]} />
                <Area type="monotone" dataKey="commission" stroke="#16a34a" fill="url(#commGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders bar chart */}
        {chartData.length > 0 && (
          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Orders per Period</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [v, "Orders"]} />
                <Bar dataKey="orders" fill="#0B1F3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

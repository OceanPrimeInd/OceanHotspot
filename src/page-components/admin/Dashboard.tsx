// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAdminNavItems } from "@/config/adminNavItems";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  Users,
  Store,
  ShoppingCart,
  AlertTriangle,
  RotateCcw,
  Award,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";

interface DashboardStats {
  totalSellers: number;
  pendingSellers: number;
  totalOrders: number;
  activeDisputes: number;
  pendingReturns: number;
  activeClubs: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingProducts: number;
  monthlyGrowth: number;
}

interface Order {
  id: string;
  order_number: string;
  buyer_name: string | null;
  buyer_email: string;
  total_amount: number;
  currency: string | null;
  status: string | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdminCheck();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalSellers: 0,
    pendingSellers: 0,
    totalOrders: 0,
    activeDisputes: 0,
    pendingReturns: 0,
    activeClubs: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingProducts: 0,
    monthlyGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; sales: number; orders: number }[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const navItems = getAdminNavItems({
    sellers: stats.pendingSellers,
    products: stats.pendingProducts,
    disputes: stats.activeDisputes,
    returns: stats.pendingReturns,
  });

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      router.push("/");
      return;
    }

    fetchAllData();
  }, [isAdmin, loading, router]);

  const fetchAllData = async () => {
    const [sellers, pendingSellers, orders, disputes, returns, clubs, products, users, pendingProducts] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_seller", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_seller", true).eq("verification_status", "pending"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("disputes").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "requested"),
      supabase.from("clubs").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    ]);

    const allOrders = orders.data || [];
    const excludedRevenueStatuses = ["cancelled", "refunded", "disputed"];
    const paidOrders = allOrders.filter(
      (o) => o.payment_status === "paid" && !excludedRevenueStatuses.includes(o.status)
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Generate monthly sales data
    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return {
        name: date.toLocaleString("en-GB", { month: "short" }),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    });

    const monthlyData = monthBuckets.map((bucket) => {
      const monthPaidOrders = paidOrders.filter((o) => {
        if (!o.created_at) return false;
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === bucket.month && orderDate.getFullYear() === bucket.year;
      });
      const monthAllOrders = allOrders.filter((o) => {
        if (!o.created_at) return false;
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === bucket.month && orderDate.getFullYear() === bucket.year;
      });
      return {
        name: bucket.name,
        sales: monthPaidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        orders: monthAllOrders.length,
      };
    });
    setSalesData(monthlyData);

    const currentMonthRevenue = monthlyData[monthlyData.length - 1]?.sales || 0;
    const previousMonthRevenue = monthlyData[monthlyData.length - 2]?.sales || 0;
    const monthlyGrowth =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

    setRecentOrders(allOrders.slice(0, 10));

    setStats({
      totalSellers: sellers.count || 0,
      pendingSellers: pendingSellers.count || 0,
      totalOrders: allOrders.length,
      activeDisputes: disputes.count || 0,
      pendingReturns: returns.count || 0,
      activeClubs: clubs.count || 0,
      totalRevenue,
      totalProducts: products.count || 0,
      totalUsers: users.count || 0,
      pendingProducts: pendingProducts.count || 0,
      monthlyGrowth,
    });
    setLoadingStats(false);
  };

  if (loading || loadingStats) {
    return (
      <DashboardLayout sidebarItems={getAdminNavItems()} sidebarTitle="Admin Portal">
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const actionCards = [
    {
      title: "Product Review",
      description: `${stats.pendingProducts} pending review`,
      icon: Package,
      href: "/admin/products",
      color: "bg-yellow-100 text-yellow-600",
      badge: stats.pendingProducts,
    },
    {
      title: "Seller Verification",
      description: `${stats.pendingSellers} pending approval`,
      icon: Store,
      href: "/admin/sellers",
      color: "bg-blue-100 text-blue-600",
      badge: stats.pendingSellers,
    },
    {
      title: "Orders",
      description: `${stats.totalOrders} total orders`,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Disputes",
      description: `${stats.activeDisputes} active disputes`,
      icon: AlertTriangle,
      href: "/admin/disputes",
      color: "bg-orange-100 text-orange-600",
      badge: stats.activeDisputes,
    },
    {
      title: "Returns",
      description: `${stats.pendingReturns} pending returns`,
      icon: RotateCcw,
      href: "/admin/returns",
      color: "bg-purple-100 text-purple-600",
      badge: stats.pendingReturns,
    },
    {
      title: "Club Partnerships",
      description: `${stats.activeClubs} active clubs`,
      icon: Award,
      href: "/admin/clubs",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Users",
      description: `${stats.totalUsers} total users`,
      icon: Users,
      href: "/admin/users",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Admin Portal">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-headline mb-2">Ocean Hotspot Admin Dashboard</h1>
          <p className="text-base text-muted-foreground">
            Manage sellers, orders, disputes, returns, and platform settings
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={`£${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="success"
            trend={{ value: stats.monthlyGrowth, isPositive: stats.monthlyGrowth >= 0 }}
          />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} variant="primary" />
          <StatCard
            title="Active Products"
            value={stats.totalProducts}
            subtitle={stats.pendingProducts > 0 ? `${stats.pendingProducts} pending review` : undefined}
            icon={Package}
            variant={stats.pendingProducts > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Verified Sellers"
            value={stats.totalSellers - stats.pendingSellers}
            subtitle={`${stats.pendingSellers} pending`}
            icon={Store}
            variant={stats.pendingSellers > 0 ? "warning" : "default"}
          />
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Open Disputes"
            value={stats.activeDisputes}
            icon={AlertTriangle}
            variant={stats.activeDisputes > 0 ? "danger" : "default"}
          />
          <StatCard
            title="Pending Returns"
            value={stats.pendingReturns}
            icon={RotateCcw}
            variant={stats.pendingReturns > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Pending Sellers"
            value={stats.pendingSellers}
            icon={Store}
            variant={stats.pendingSellers > 0 ? "warning" : "default"}
          />
          <StatCard title="Active Clubs" value={stats.activeClubs} icon={Award} variant="primary" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart data={salesData} title="Platform Revenue (Last 6 Months)" type="area" />
          <SalesChart data={salesData} title="Orders by Month" type="bar" />
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <RecentOrdersTable orders={recentOrders} title="Recent Platform Orders" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

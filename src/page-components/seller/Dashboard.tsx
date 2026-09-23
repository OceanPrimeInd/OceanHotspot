// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSellerNavItems } from "@/config/sellerNavItems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  Plus,
  Package,
  Upload,
  ShoppingCart,
  Mail,
  TrendingUp,
  CreditCard,
  DollarSign,
  Clock,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Download,
} from "lucide-react";
import { isShopOpen } from "@/config/shop";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { getStatusInfo } from "@/config/productStatus";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  is_published: boolean;
  status: string | null;
  image_url: string | null;
  created_at: string;
}

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  pendingReviewProducts: number;
  rejectedProducts: number;
  pendingOrders: number;
  unreadEnquiries: number;
  totalRevenue: number;
  pendingPayments: number;
  completedOrders: number;
  monthlyGrowth: number;
}

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    publishedProducts: 0,
    pendingReviewProducts: 0,
    rejectedProducts: 0,
    pendingOrders: 0,
    unreadEnquiries: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedOrders: 0,
    monthlyGrowth: 12.5,
  });
  const [salesData, setSalesData] = useState<{ name: string; sales: number; orders: number }[]>([]);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const navItems = getSellerNavItems({
    orders: stats.pendingOrders,
    enquiries: stats.unreadEnquiries,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && !profile.is_seller) {
      router.push("/seller/onboarding");
      return;
    }

    if (profile?.is_seller) {
      fetchAllData();
    }
  }, [user, profile, authLoading, router]);

  const fetchAllData = async () => {
    if (!user) return;

    // Fetch products
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (productsData) {
      setProducts(productsData);
    }

    // Calculate stats
    const [enquiryResult, allOrdersResult] = await Promise.all([
      supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_read", false),
      supabase
        .from("orders")
        .select("total_amount, status, payment_status, created_at")
        .eq("seller_id", user.id),
    ]);

    const allOrders = allOrdersResult.data || [];
    const completedStatuses = ["completed", "delivered"];
    const excludedRevenueStatuses = ["cancelled", "refunded", "disputed"];
    const pendingActionStatuses = ["paid", "processing", "shipped"];

    const paidOrders = allOrders.filter(
      (o) => o.payment_status === "paid" && !excludedRevenueStatuses.includes(o.status)
    );

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const pendingPayments = paidOrders
      .filter((o) => !completedStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const completedOrders = allOrders.filter((o) => completedStatuses.includes(o.status)).length;
    const pendingOrders = allOrders.filter((o) => pendingActionStatuses.includes(o.status)).length;

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

    setStats({
      totalProducts: productsData?.length || 0,
      publishedProducts: productsData?.filter((p) => p.is_published).length || 0,
      pendingReviewProducts: productsData?.filter((p) => p.status === "pending_review").length || 0,
      rejectedProducts: productsData?.filter((p) => p.status === "rejected").length || 0,
      pendingOrders,
      unreadEnquiries: enquiryResult.count || 0,
      totalRevenue,
      pendingPayments,
      completedOrders,
      monthlyGrowth,
    });

    setLoading(false);
  };

  if (authLoading || loading || !profile?.is_seller) {
    return (
      <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller Center">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const recentProducts = products.slice(0, 5);

  const quickActions = [
    {
      title: "Create Product",
      description: "List a new product",
      icon: Plus,
      href: "/seller/products/new",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Bulk Upload",
      description: "Upload CSV",
      icon: Upload,
      href: "/seller/bulk-upload",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "View Products",
      description: `${stats.totalProducts} total`,
      icon: Package,
      href: "/seller/products",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Orders",
      description: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      href: "/seller/orders",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Enquiries",
      description: `${stats.unreadEnquiries} unread`,
      icon: Mail,
      href: "/seller/enquiries",
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Seller Center">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-bold text-headline mb-2">
            {profile.company_name || profile.trading_name || "Your"} Seller Dashboard
          </h1>
          <p className="text-base text-muted-foreground">
            Track your sales, manage products, and respond to customer enquiries.
          </p>
        </div>

        {stats.totalProducts === 0 && (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="font-semibold text-headline">Welcome — load your products</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Download the CSV template, add products one by one, or use bulk upload when your range is ready.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/ocean-hotspot-product-template.csv" download>
                  <Download className="mr-2 h-4 w-4" />
                  Product template (CSV)
                </a>
              </Button>
              <Button variant="o42Primary" size="sm" asChild>
                <Link href="/seller/products/new">Add a product</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/seller/bulk-upload">Bulk upload</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Stripe Connection Banner */}
        {isShopOpen() && !profile.stripe_charges_enabled && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                {profile.stripe_onboarding_complete
                  ? "Stripe Verification Pending"
                  : "Connect Stripe to Start Selling"}
              </h3>
              <p className="text-sm text-amber-700 mt-0.5">
                {profile.stripe_onboarding_complete
                  ? "Stripe is reviewing your details. Product uploads are disabled until verification is complete."
                  : "You need to connect your Stripe account before you can list products and receive payments."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 flex-shrink-0"
              asChild
            >
              <Link href="/seller/onboarding?step=2">
                {profile.stripe_onboarding_complete ? "Check Status" : "Connect Stripe"}
              </Link>
            </Button>
          </div>
        )}

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={`£${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="success"
            trend={{ value: stats.monthlyGrowth, isPositive: stats.monthlyGrowth >= 0 }}
          />
          <StatCard
            title="Pending Payments"
            value={`£${stats.pendingPayments.toLocaleString()}`}
            subtitle="Awaiting release"
            icon={CreditCard}
            variant="warning"
          />
          <StatCard
            title="Completed Orders"
            value={stats.completedOrders}
            subtitle="Successfully delivered"
            icon={TrendingUp}
            variant="primary"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Needs action"
            icon={Clock}
            variant={stats.pendingOrders > 0 ? "danger" : "default"}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow group"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color} mb-3`}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart data={salesData} title="Sales Trend (Last 6 Months)" type="area" />
          <SalesChart data={salesData} title="Orders by Month" type="bar" />
        </div>

        {/* Product Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Products" value={stats.totalProducts} icon={Package} variant="default" />
          <StatCard title="Active" value={stats.publishedProducts} icon={Package} variant="success" />
          <StatCard
            title="Pending Review"
            value={stats.pendingReviewProducts}
            icon={Clock}
            variant={stats.pendingReviewProducts > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedProducts}
            icon={AlertTriangle}
            variant={stats.rejectedProducts > 0 ? "danger" : "default"}
          />
        </div>

        {/* Recent Products */}
        <div className="rounded-xl border border-border bg-card shadow-sm mb-8">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Products</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
              <Link href="/seller/products">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {recentProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No products yet</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/seller/products/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Your First Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentProducts.map((product) => {
                const statusInfo = getStatusInfo(product.status);
                return (
                  <Link
                    key={product.id}
                    href={`/seller/products/${product.id}/edit`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.price > 0
                          ? `£${product.price.toLocaleString()}`
                          : "Price on enquiry"}
                      </p>
                    </div>
                    <Badge className={`${statusInfo.color} border text-xs flex-shrink-0`}>
                      {statusInfo.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Enquiries & Messages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Customer Enquiries"
            value={stats.unreadEnquiries}
            subtitle={stats.unreadEnquiries > 0 ? "Unread" : "All read"}
            icon={Mail}
            variant={stats.unreadEnquiries > 0 ? "warning" : "default"}
          />
          <StatCard title="Messages" value={0} icon={MessageSquare} variant="default" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;

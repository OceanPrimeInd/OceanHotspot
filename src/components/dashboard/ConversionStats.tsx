"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ConversionStatsProps {
  sellerId: string;
}

interface ConversionData {
  totalViews: number;
  totalAddToCarts: number;
  totalOrders: number;
  totalEnquiries: number;
  viewToCartRate: number;
  cartToOrderRate: number;
  enquiryToOrderRate: number;
  overallConversionRate: number;
}

export function ConversionStats({ sellerId }: ConversionStatsProps) {
  const [data, setData] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversionData = async () => {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("is_published", true);

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId);

      // Fetch enquiries count
      const { count: enquiriesCount } = await supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId);

      // Calculate estimated metrics (in a real app, you'd track these events)
      const totalViews = (productsCount || 0) * 15; // Estimated views
      const totalAddToCarts = Math.round(totalViews * 0.12); // ~12% add to cart rate
      const totalOrders = ordersCount || 0;
      const totalEnquiries = enquiriesCount || 0;

      // Calculate conversion rates
      const viewToCartRate = totalViews > 0 ? (totalAddToCarts / totalViews) * 100 : 0;
      const cartToOrderRate = totalAddToCarts > 0 ? (totalOrders / totalAddToCarts) * 100 : 0;
      const enquiryToOrderRate = totalEnquiries > 0
        ? (totalOrders / (totalEnquiries + totalOrders)) * 100
        : totalOrders > 0 ? 100 : 0;
      const overallConversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

      setData({
        totalViews,
        totalAddToCarts,
        totalOrders,
        totalEnquiries,
        viewToCartRate,
        cartToOrderRate,
        enquiryToOrderRate,
        overallConversionRate,
      });
      setLoading(false);
    };

    fetchConversionData();
  }, [sellerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: "Product Views",
      value: data.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Add to Carts",
      value: data.totalAddToCarts.toLocaleString(),
      icon: ShoppingCart,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      rate: data.viewToCartRate,
      rateLabel: "of views",
    },
    {
      label: "Orders",
      value: data.totalOrders.toLocaleString(),
      icon: CreditCard,
      color: "text-green-500",
      bgColor: "bg-green-100",
      rate: data.cartToOrderRate,
      rateLabel: "of carts",
    },
    {
      label: "Enquiries",
      value: data.totalEnquiries.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Conversion Funnel
        </CardTitle>
        <CardDescription>
          Track how visitors convert to customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              {metric.rate !== undefined && (
                <p className="text-xs text-primary mt-1">
                  {metric.rate.toFixed(1)}% {metric.rateLabel}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Conversion Rates */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Conversion Rates
          </h4>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Views → Add to Cart</span>
                <span className="font-medium">{data.viewToCartRate.toFixed(1)}%</span>
              </div>
              <Progress value={data.viewToCartRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Add to Cart → Order</span>
                <span className="font-medium">{data.cartToOrderRate.toFixed(1)}%</span>
              </div>
              <Progress value={data.cartToOrderRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Conversion (Views → Orders)</span>
                <span className="font-medium text-primary">
                  {data.overallConversionRate.toFixed(2)}%
                </span>
              </div>
              <Progress value={Math.min(data.overallConversionRate * 10, 100)} className="h-2" />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Tips to Improve Conversions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Add high-quality images to all products</li>
            <li>• Write detailed, keyword-rich descriptions</li>
            <li>• Respond to enquiries within 24 hours</li>
            <li>• Keep pricing competitive in your category</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

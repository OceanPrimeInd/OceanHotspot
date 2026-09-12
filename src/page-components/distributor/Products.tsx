// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Package,
  Building2,
  Plus,
  X,
  CheckCircle2,
  Globe,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  seller_id: string;
  product_id: string | null;
  commission_rate: number | null;
  status: string;
  created_at: string;
  profiles?: { company_name: string; trading_name: string; logo_url: string };
  products?: { title: string; price: number; currency: string; image_url: string };
}

interface AvailableVendor {
  id: string;
  company_name: string;
  trading_name: string | null;
  logo_url: string | null;
  main_category: string | null;
  short_description: string | null;
}

export default function DistributorProducts() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [distributor, setDistributor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [availableVendors, setAvailableVendors] = useState<AvailableVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"portfolio" | "discover">("portfolio");
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/products");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const { data: dist } = await supabase
      .from("distributors")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!dist) { router.push("/distributor/register"); return; }
    setDistributor(dist);

    const [portRes, vendorsRes] = await Promise.all([
      supabase
        .from("distributor_products")
        .select("*, profiles:seller_id(company_name, trading_name, logo_url), products:product_id(title, price, currency, image_url)")
        .eq("distributor_id", dist.id)
        .eq("status", "active"),
      supabase
        .from("profiles")
        .select("id, company_name, trading_name, logo_url, main_category, short_description")
        .eq("is_seller", true)
        .not("company_name", "is", null)
        .limit(50),
    ]);

    setPortfolio(portRes.data || []);
    setAvailableVendors(vendorsRes.data || []);
    setLoading(false);
  };

  const addVendor = async (sellerId: string) => {
    if (!distributor) return;
    setAdding(sellerId);
    try {
      const { error } = await supabase.from("distributor_products").insert({
        distributor_id: distributor.id,
        seller_id: sellerId,
        product_id: null, // represents whole catalog
        commission_rate: distributor.commission_rate,
        status: "active",
      });
      if (error) throw error;
      toast({ title: "Vendor added to your portfolio!" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(null);
    }
  };

  const removeFromPortfolio = async (itemId: string) => {
    const { error } = await supabase
      .from("distributor_products")
      .update({ status: "inactive" })
      .eq("id", itemId);
    if (!error) {
      toast({ title: "Removed from portfolio" });
      loadData();
    }
  };

  const navItems = getDistributorNavItems();
  const portfolioSellerIds = new Set(portfolio.map(p => p.seller_id));

  const filteredVendors = availableVendors.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.company_name?.toLowerCase().includes(q) ||
      v.trading_name?.toLowerCase().includes(q) ||
      v.main_category?.toLowerCase().includes(q)
    );
  });

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
    <DashboardLayout sidebarItems={navItems} sidebarTitle="Distributor">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Vendor Portfolio</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage the brands you represent and discover new vendors to partner with.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "portfolio" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Portfolio ({portfolio.length})
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "discover" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Discover Vendors
          </button>
        </div>

        {activeTab === "portfolio" && (
          <>
            {portfolio.length === 0 ? (
              <div className="bg-card border rounded-xl py-16 text-center">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium mb-2">No vendors in your portfolio yet</p>
                <p className="text-sm text-muted-foreground mb-4">Switch to "Discover Vendors" to find brands to represent.</p>
                <Button onClick={() => setActiveTab("discover")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Discover Vendors
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.map(item => (
                  <div key={item.id} className="bg-card border rounded-xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {item.profiles?.logo_url ? (
                        <img src={item.profiles.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {item.profiles?.trading_name || item.profiles?.company_name || "Vendor"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.product_id ? "Specific product" : "Full catalog"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          {item.commission_rate ?? distributor?.commission_rate}% commission
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromPortfolio(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "discover" && (
          <>
            <div className="relative mb-5">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vendors by name or category..."
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVendors.map(vendor => {
                const alreadyAdded = portfolioSellerIds.has(vendor.id);
                return (
                  <div key={vendor.id} className="bg-card border rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {vendor.logo_url ? (
                          <img src={vendor.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {vendor.trading_name || vendor.company_name}
                        </p>
                        {vendor.main_category && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded-full mt-1">
                            {vendor.main_category}
                          </span>
                        )}
                        {vendor.short_description && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            {vendor.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      {alreadyAdded ? (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          In Portfolio
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white"
                          onClick={() => addVendor(vendor.id)}
                          disabled={adding === vendor.id}
                        >
                          {adding === vendor.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          Add to Portfolio
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

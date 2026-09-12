// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getSellerNavItems } from "@/config/sellerNavItems";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Users,
  MapPin,
  Globe,
  CheckCircle2,
  Plus,
  X,
  TrendingUp,
  Mail,
  ExternalLink,
} from "lucide-react";

interface Distributor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  location: string | null;
  description: string | null;
  coverage_areas: string[];
  specializations: string[];
  commission_rate: number;
  years_in_business: number | null;
  status: string;
}

interface PartnerEntry {
  id: string;
  distributor_id: string;
  commission_rate: number | null;
  status: string;
  created_at: string;
}

export default function SellerDistributors() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [partners, setPartners] = useState<PartnerEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"partners" | "discover">("discover");
  const [actioning, setActioning] = useState<string | null>(null);
  const [commOverrides, setCommOverrides] = useState<Record<string, string>>({});
  const [outreachDist, setOutreachDist] = useState<Distributor | null>(null);
  const [outreachMsg, setOutreachMsg] = useState("");
  const [sendingOutreach, setSendingOutreach] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/seller/distributors");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const [distRes, partnerRes] = await Promise.all([
      supabase
        .from("distributors")
        .select("*")
        .eq("status", "approved")
        .order("company_name"),
      supabase
        .from("distributor_products")
        .select("id, distributor_id, commission_rate, status, created_at")
        .eq("seller_id", user!.id)
        .eq("status", "active"),
    ]);

    setDistributors(distRes.data || []);
    setPartners(partnerRes.data || []);
    setLoading(false);
  };

  const partnerDistIds = new Set(partners.map(p => p.distributor_id));

  const filtered = distributors.filter(d => {
    const q = search.toLowerCase();
    return (
      d.company_name?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q) ||
      d.coverage_areas?.some(a => a.toLowerCase().includes(q)) ||
      d.specializations?.some(s => s.toLowerCase().includes(q))
    );
  });

  const myPartners = distributors.filter(d => partnerDistIds.has(d.id));

  const addPartner = async (distId: string) => {
    setActioning(distId);
    const dist = distributors.find(d => d.id === distId);
    const commRate = commOverrides[distId] ? parseFloat(commOverrides[distId]) : dist?.commission_rate;

    try {
      const { error } = await supabase.from("distributor_products").insert({
        distributor_id: distId,
        seller_id: user!.id,
        product_id: null,
        commission_rate: commRate,
        status: "active",
      });
      if (error) throw error;
      toast({ title: "Partnership created!", description: `${dist?.company_name} can now represent your products.` });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActioning(null);
    }
  };

  const removePartner = async (distId: string) => {
    const entry = partners.find(p => p.distributor_id === distId);
    if (!entry) return;
    setActioning(distId);
    await supabase.from("distributor_products").update({ status: "inactive" }).eq("id", entry.id);
    toast({ title: "Partnership removed" });
    loadData();
    setActioning(null);
  };

  const sendOutreach = async () => {
    if (!outreachDist || !outreachMsg.trim()) return;
    setSendingOutreach(true);
    try {
      const { error } = await supabase.from("outreach_logs").insert({
        seller_id: user!.id,
        target_company: outreachDist.company_name,
        target_email: outreachDist.email,
        subject: `Distribution Partnership Enquiry from ${profile?.trading_name || profile?.company_name}`,
        message: outreachMsg,
        status: "draft",
      });
      if (error) throw error;
      toast({ title: "Outreach saved!", description: "Your message has been saved. Contact the distributor directly at their email." });
      setOutreachDist(null);
      setOutreachMsg("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSendingOutreach(false);
    }
  };

  const generateOutreachTemplate = (dist: Distributor) => {
    const sellerName = profile?.trading_name || profile?.company_name || "our company";
    return `Dear ${dist.contact_name},

I am reaching out on behalf of ${sellerName}, a marine products supplier on OceanHotspot.

We are looking to expand our distribution network in ${dist.coverage_areas.slice(0, 3).join(", ")} and believe your company would be an excellent fit to represent our products in your region.

We would love to explore a partnership arrangement where you represent our catalogue through your existing sales channels. Our standard commission is competitive, and we are open to discussing terms that work best for both parties.

Would you be available for a brief call to discuss further?

Best regards,
${profile?.full_name || "The Team at " + sellerName}`;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={getSellerNavItems()} sidebarTitle="Seller">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Distributor Network</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect with approved distributors to expand your sales reach. They sell on your behalf and earn commission.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Partners", value: partners.length, color: "text-green-600" },
            { label: "Available Distributors", value: distributors.length, color: "text-blue-600" },
            { label: "Coverage Regions", value: new Set(distributors.flatMap(d => d.coverage_areas)).size, color: "text-purple-600" },
            { label: "Avg Commission", value: distributors.length > 0 ? `${(distributors.reduce((s, d) => s + d.commission_rate, 0) / distributors.length).toFixed(1)}%` : "—", color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "discover" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Discover ({distributors.length})
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "partners" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Partners ({myPartners.length})
          </button>
        </div>

        {/* Outreach modal */}
        {outreachDist && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Contact {outreachDist.company_name}</h3>
                <button onClick={() => setOutreachDist(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Draft your outreach message. Send it directly to{" "}
                <a href={`mailto:${outreachDist.email}`} className="text-primary font-medium">{outreachDist.email}</a>
              </p>
              <Label>Message</Label>
              <textarea
                value={outreachMsg}
                onChange={e => setOutreachMsg(e.target.value)}
                className="w-full mt-1 border rounded-lg p-3 text-sm h-48 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOutreachMsg(generateOutreachTemplate(outreachDist))}
                >
                  Use Template
                </Button>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setOutreachDist(null)}>Cancel</Button>
                <Button
                  onClick={sendOutreach}
                  disabled={sendingOutreach || !outreachMsg.trim()}
                  className="bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white"
                >
                  {sendingOutreach ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                  Save & Contact
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "discover" && (
          <>
            <div className="relative mb-5">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, region, or specialization..."
                className="pl-9"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="bg-card border rounded-xl py-16 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No distributors found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(dist => {
                  const isPartner = partnerDistIds.has(dist.id);
                  return (
                    <div key={dist.id} className="bg-card border rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{dist.company_name}</p>
                          <p className="text-sm text-muted-foreground">{dist.contact_name}</p>
                        </div>
                        <span className="text-sm font-bold text-amber-600 shrink-0 ml-2">
                          {dist.commission_rate}% commission
                        </span>
                      </div>

                      {dist.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />{dist.location}
                          {dist.years_in_business && ` · ${dist.years_in_business}yrs experience`}
                        </p>
                      )}

                      {dist.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{dist.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {dist.coverage_areas.slice(0, 3).map(a => (
                          <span key={a} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                        {dist.coverage_areas.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{dist.coverage_areas.length - 3}</span>
                        )}
                      </div>

                      {!isPartner && (
                        <div className="flex items-center gap-2 mb-3">
                          <Label className="text-xs shrink-0">Custom commission %</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            placeholder={String(dist.commission_rate)}
                            value={commOverrides[dist.id] || ""}
                            onChange={e => setCommOverrides(prev => ({ ...prev, [dist.id]: e.target.value }))}
                            className="h-7 text-xs w-20"
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {isPartner ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => removePartner(dist.id)}
                            disabled={actioning === dist.id}
                          >
                            <X className="w-3.5 h-3.5 mr-1.5" />
                            Remove Partner
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white"
                            onClick={() => addPartner(dist.id)}
                            disabled={actioning === dist.id}
                          >
                            {actioning === dist.id
                              ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              : <Plus className="w-3.5 h-3.5 mr-1.5" />
                            }
                            Add Partner
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOutreachDist(dist);
                            setOutreachMsg("");
                          }}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "partners" && (
          <>
            {myPartners.length === 0 ? (
              <div className="bg-card border rounded-xl py-16 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium mb-2">No distribution partners yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse distributors and add them as partners to expand your sales reach.
                </p>
                <Button onClick={() => setActiveTab("discover")}>
                  <Search className="w-4 h-4 mr-2" />
                  Find Distributors
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPartners.map(dist => {
                  const partnerEntry = partners.find(p => p.distributor_id === dist.id);
                  return (
                    <div key={dist.id} className="bg-card border rounded-xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {dist.company_name}
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </p>
                          <p className="text-sm text-muted-foreground">{dist.contact_name}</p>
                        </div>
                        <span className="text-sm font-bold text-amber-600">
                          {partnerEntry?.commission_rate ?? dist.commission_rate}% commission
                        </span>
                      </div>
                      {dist.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />{dist.location}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dist.coverage_areas.slice(0, 3).map(a => (
                          <span key={a} className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setOutreachDist(dist);
                            setOutreachMsg("");
                          }}
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => removePartner(dist.id)}
                          disabled={actioning === dist.id}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

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
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  RefreshCw,
  Search,
  MapPin,
  Package,
  TrendingUp,
  ChevronRight,
  Truck,
  Users,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";

export default function DistributorSourcing() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [myDistributor, setMyDistributor] = useState<any>(null);
  const [allDistributors, setAllDistributors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  // Partnership request
  const [partnerTarget, setPartnerTarget] = useState<any>(null);
  const [partnerNote, setPartnerNote] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/sourcing");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const [myRes, allRes] = await Promise.all([
      supabase
        .from("distributors")
        .select("id, company_name, coverage_areas, specializations, location")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("distributors")
        .select("id, company_name, location, coverage_areas, specializations, commission_rate, contact_email, contact_phone")
        .eq("status", "approved"),
    ]);

    if (!myRes.data) { router.push("/distributor/register"); return; }

    setMyDistributor(myRes.data);
    // Exclude self
    setAllDistributors((allRes.data || []).filter(d => d.id !== myRes.data.id));
    setLoading(false);
  };

  const myAreas = new Set(myDistributor?.coverage_areas || []);

  // Distributors who cover regions I DON'T cover (sourcing candidates)
  const sourcingCandidates = allDistributors.filter(d =>
    (d.coverage_areas || []).some((area: string) => !myAreas.has(area))
  );

  // All unique regions across the network
  const allRegions = Array.from(
    new Set(allDistributors.flatMap(d => d.coverage_areas || []))
  ).sort();

  const filtered = (regionFilter === "all" ? allDistributors : allDistributors.filter(d =>
    (d.coverage_areas || []).includes(regionFilter)
  )).filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.company_name?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q) ||
      (d.specializations || []).some((s: string) => s.toLowerCase().includes(q))
    );
  });

  const handleRequestPartnership = async () => {
    if (!partnerTarget || !myDistributor) return;
    setRequesting(true);
    try {
      // Create a cross_source_orders record with status 'pending' as an intent/request
      const { error } = await supabase.from("cross_source_orders").insert({
        primary_distributor_id: myDistributor.id,
        sourcing_distributor_id: partnerTarget.id,
        status: "pending",
        notes: partnerNote || `Partnership request from ${myDistributor.company_name}`,
      });
      if (error) throw error;
      setRequested(prev => new Set(prev).add(partnerTarget.id));
      toast({ title: "Partnership request sent!", description: `${partnerTarget.company_name} will be notified.` });
      setPartnerTarget(null);
      setPartnerNote("");
    } catch (err: any) {
      toast({ title: "Error sending request", description: err.message, variant: "destructive" });
    } finally {
      setRequesting(false);
    }
  };

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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#0B1F3B]" />
            Find Other Distributors
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            If a customer orders something you can't ship to, another distributor can handle it — and you both get paid.
          </p>
        </div>

        {/* How it works banner */}
        <div className="bg-[#0B1F3B]/5 border border-[#0B1F3B]/20 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-[#0B1F3B] mb-3">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { step: 1, icon: Package, label: "A customer orders something you can't ship to their location" },
              { step: 2, icon: Users, label: "You find another distributor who covers that area" },
              { step: 3, icon: TrendingUp, label: "They send the order — you both get paid" },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0B1F3B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <p className="text-muted-foreground leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sourcing opportunities */}
        {sourcingCandidates.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Good Matches For You ({sourcingCandidates.length})
            </h2>
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">
              These distributors cover areas you don't — they can help you fulfil orders in those places.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {sourcingCandidates.slice(0, 4).map(d => {
                const newAreas = (d.coverage_areas || []).filter((a: string) => !myAreas.has(a));
                return (
                  <div key={d.id} className="bg-white dark:bg-card border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{d.company_name}</p>
                        {d.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {d.location}
                          </p>
                        )}
                      </div>
                      {d.commission_rate && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {d.commission_rate}% earnings
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {newAreas.slice(0, 3).map((area: string) => (
                        <span key={area} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          {area}
                        </span>
                      ))}
                      {newAreas.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{newAreas.length - 3} more</span>
                      )}
                    </div>
                    {d.contact_email && (
                      <a href={`mailto:${d.contact_email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                        Contact <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location, or product type..."
              className="pl-9"
            />
          </div>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Regions</option>
            {allRegions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* All distributors table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-semibold text-sm">All Distributors in the Network ({filtered.length})</h2>
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No distributors match your search.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(d => (
                <div key={d.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#0B1F3B]/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-[#0B1F3B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{d.company_name}</p>
                      {d.commission_rate && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {d.commission_rate}% earnings
                        </span>
                      )}
                      {(d.coverage_areas || []).some((a: string) => !myAreas.has(a)) && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Can help you
                        </span>
                      )}
                    </div>
                    {d.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {d.location}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(d.coverage_areas || []).slice(0, 4).map((area: string) => (
                        <span key={area} className={`text-xs px-2 py-0.5 rounded-full ${
                          myAreas.has(area)
                            ? "bg-[#0B1F3B]/10 text-[#0B1F3B]"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {area}
                        </span>
                      ))}
                      {(d.coverage_areas || []).length > 4 && (
                        <span className="text-xs text-muted-foreground">+{(d.coverage_areas || []).length - 4} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {requested.has(d.id) ? (
                      <span className="text-xs flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Requested
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white text-xs"
                        onClick={() => setPartnerTarget(d)}
                      >
                        Request Partnership
                      </Button>
                    )}
                    {d.contact_email && (
                      <a href={`mailto:${d.contact_email}`} className="shrink-0">
                        <Button variant="outline" size="sm" className="w-full text-xs">Email</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0B1F3B]/10 border" />
            You cover this area too
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-200" />
            They cover this — you don't (good for teamwork)
          </div>
        </div>
      </div>

      {/* ── Partnership Request Modal ─────────────────────────────────── */}
      {partnerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Request Partnership</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Ask <strong>{partnerTarget.company_name}</strong> to help fulfil orders in their areas.
                </p>
              </div>
              <button onClick={() => { setPartnerTarget(null); setPartnerNote(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-muted/40 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium mb-1">They cover these areas you don't:</p>
              <div className="flex flex-wrap gap-1">
                {(partnerTarget.coverage_areas || [])
                  .filter((a: string) => !myAreas.has(a))
                  .map((a: string) => (
                    <span key={a} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1.5">Message (optional)</label>
              <textarea
                value={partnerNote}
                onChange={e => setPartnerNote(e.target.value)}
                rows={3}
                placeholder={`Hi, I'm ${myDistributor?.company_name}. I'd like to partner with you to handle orders in areas I don't cover...`}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRequestPartnership}
                disabled={requesting}
                className="flex-1 bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white gap-2"
              >
                {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {requesting ? "Sending..." : "Send Request"}
              </Button>
              <Button variant="outline" onClick={() => { setPartnerTarget(null); setPartnerNote(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

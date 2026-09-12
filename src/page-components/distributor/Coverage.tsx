// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDistributorNavItems } from "@/config/distributorNavItems";
import { Loader2, MapPin, Globe, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

// All regions and their distributor coverage colour logic
const ALL_REGIONS = [
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Scandinavia", flag: "🇸🇪" },
  { name: "Mediterranean", flag: "🌊" },
  { name: "Middle East", flag: "🇦🇪" },
  { name: "North America", flag: "🇺🇸" },
  { name: "Caribbean", flag: "🌴" },
  { name: "Asia Pacific", flag: "🌏" },
  { name: "Global", flag: "🌐" },
];

export default function DistributorCoverage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [myAreas, setMyAreas] = useState<string[]>([]);
  const [allDistributors, setAllDistributors] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/coverage");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);

    const [myRes, allRes] = await Promise.all([
      supabase
        .from("distributors")
        .select("coverage_areas")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("distributors")
        .select("id, company_name, location, coverage_areas, status")
        .eq("status", "approved"),
    ]);

    if (!myRes.data) { router.push("/distributor/register"); return; }

    setMyAreas(myRes.data.coverage_areas || []);
    setAllDistributors(allRes.data || []);
    setLoading(false);
  };

  // Coverage density per region
  const coverageCount = new Map<string, number>();
  allDistributors.forEach(d => {
    (d.coverage_areas || []).forEach((area: string) => {
      coverageCount.set(area, (coverageCount.get(area) || 0) + 1);
    });
  });

  const maxCount = Math.max(...Array.from(coverageCount.values()), 1);

  const distributorsInRegion = selectedRegion
    ? allDistributors.filter(d => d.coverage_areas?.includes(selectedRegion))
    : [];

  const uncoveredRegions = ALL_REGIONS.filter(r => !coverageCount.has(r.name));

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
        <h1 className="text-2xl font-bold mb-1">My Areas Map</h1>
        <p className="text-muted-foreground text-sm mb-8">
          See which areas across the world are covered, and where you fit in.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Region grid */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Who Covers What
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_REGIONS.map(region => {
                const count = coverageCount.get(region.name) || 0;
                const isMine = myAreas.includes(region.name);
                const density = count / maxCount;
                const bg = count === 0
                  ? "bg-muted border-dashed"
                  : density > 0.6
                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                  : density > 0.2
                  ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700";

                return (
                  <button
                    key={region.name}
                    onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    className={`border rounded-xl p-3 text-left transition-all hover:shadow-md ${bg} ${
                      selectedRegion === region.name ? "ring-2 ring-[#0B1F3B]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{region.flag}</span>
                      {isMine && (
                        <span className="text-xs bg-[#0B1F3B] text-white px-1.5 py-0.5 rounded-full">Mine</span>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight">{region.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {count === 0 ? "Uncovered" : `${count} distributor${count !== 1 ? "s" : ""}`}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300" />Many distributors</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300" />Some distributors</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200" />Only one person</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-muted border border-dashed" />Nobody yet</div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected region details */}
            {selectedRegion && (
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-3">
                  {ALL_REGIONS.find(r => r.name === selectedRegion)?.flag} {selectedRegion}
                </h3>
                {distributorsInRegion.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nobody is covering this area yet.</p>
                ) : (
                  <div className="space-y-2">
                    {distributorsInRegion.map(d => (
                      <div key={d.id} className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">{d.company_name}</span>
                        {d.location && <span className="text-muted-foreground text-xs">— {d.location}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My coverage */}
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B1F3B]" />
                Your Areas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {myAreas.map(area => (
                  <span key={area} className="text-xs bg-[#0B1F3B]/10 dark:bg-blue-900/20 text-[#0B1F3B] dark:text-blue-300 px-2 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href="/distributor/profile">Update My Areas</Link>
              </Button>
            </div>

            {/* Opportunity alert */}
            {uncoveredRegions.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {uncoveredRegions.length} {uncoveredRegions.length !== 1 ? "Areas" : "Area"} With Nobody Yet
                  </p>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                  These areas have no distributor — you could be the first:
                </p>
                <div className="flex flex-wrap gap-1">
                  {uncoveredRegions.map(r => (
                    <span key={r.name} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      {r.flag} {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

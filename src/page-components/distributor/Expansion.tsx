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
import {
  Loader2,
  Zap,
  MapPin,
  AlertCircle,
  Send,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react";

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

function generateTemplate(companyName: string, region: string, specializations: string[]) {
  const specs = specializations.length > 0
    ? specializations.slice(0, 3).join(", ")
    : "marine equipment";
  return `Subject: Partnership Enquiry — ${region} Distribution

Hi,

My name is [Your Name] from ${companyName}. We are an authorised distributor on Ocean Hotspot specialising in ${specs}.

We noticed there is currently no dedicated marine equipment distributor covering ${region} on the platform, and we believe there is a strong opportunity for partnership in this region.

We'd love to explore:
• Representing your products across ${region}
• Providing local customer support and after-sales service
• Facilitating faster fulfilment through our regional network

Could we schedule a brief call to discuss how we might work together?

Best regards,
[Your Name]
${companyName}
[Your Email] | [Your Phone]`;
}

export default function DistributorExpansion() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [distributor, setDistributor] = useState<any>(null);
  const [allDistributors, setAllDistributors] = useState<any[]>([]);
  const [outreachLogs, setOutreachLogs] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logNote, setLogNote] = useState("");
  const [logging, setLogging] = useState(false);
  const [loggedRegion, setLoggedRegion] = useState<string | null>(null);
  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor/expansion");
      return;
    }
    if (!authLoading && user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const [distRes, allRes, logsRes] = await Promise.all([
      supabase
        .from("distributors")
        .select("id, company_name, coverage_areas, specializations, location, status")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("distributors")
        .select("id, coverage_areas, status")
        .eq("status", "approved"),
      supabase
        .from("outreach_logs")
        .select("id, region, notes, created_at")
        .eq("distributor_id", (await supabase.from("distributors").select("id").eq("user_id", user!.id).maybeSingle()).data?.id || "")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (!distRes.data) { router.push("/distributor/register"); return; }

    setDistributor(distRes.data);
    setAllDistributors(allRes.data || []);
    setOutreachLogs(logsRes.data || []);
    setLoading(false);
  };

  const coverageCount = new Map<string, number>();
  allDistributors.forEach(d => {
    (d.coverage_areas || []).forEach((area: string) => {
      coverageCount.set(area, (coverageCount.get(area) || 0) + 1);
    });
  });

  const gaps = ALL_REGIONS.filter(r => !coverageCount.has(r.name));
  const lowCoverage = ALL_REGIONS.filter(r => {
    const count = coverageCount.get(r.name) || 0;
    return count > 0 && count < 2;
  });
  const myAreas = distributor?.coverage_areas || [];
  const alreadyLogged = new Set(outreachLogs.map(l => l.region));

  const fetchAiSuggestions = async () => {
    if (!distributor) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("expansion-agent", {
        body: { distributorId: distributor.id },
      });
      if (error) throw error;
      setAiSuggestions(data.suggestions || []);
      setAiPowered(data.ai === true);
    } catch (err) {
      console.error("AI suggestions error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (!distributor || !selectedRegion) return;
    const text = generateTemplate(distributor.company_name, selectedRegion, distributor.specializations || []);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLogOutreach = async () => {
    if (!distributor || !selectedRegion) return;
    setLogging(true);
    await supabase.from("outreach_logs").insert({
      distributor_id: distributor.id,
      region: selectedRegion,
      notes: logNote || `Outreach initiated for ${selectedRegion}`,
    });
    setLoggedRegion(selectedRegion);
    setLogging(false);
    setLogNote("");
    // Reload logs
    const { data } = await supabase
      .from("outreach_logs")
      .select("id, region, notes, created_at")
      .eq("distributor_id", distributor.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setOutreachLogs(data || []);
    setTimeout(() => setLoggedRegion(null), 3000);
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

  const template = distributor && selectedRegion
    ? generateTemplate(distributor.company_name, selectedRegion, distributor.specializations || [])
    : "";

  return (
    <DashboardLayout sidebarItems={getDistributorNavItems()} sidebarTitle="Distributor">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Find New Areas to Grow
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            See which areas have no distributor yet, get a ready-made email to contact vendors there, and keep track of who you've reached out to.
          </p>
        </div>

        {/* ── AI Recommendations ─────────────────────────────────────────── */}
        <div className="mb-8 bg-gradient-to-r from-[#0B1F3B] to-[#162d52] rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-amber-400" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  {aiPowered ? "AI-Powered Suggestions" : "Smart Suggestions"}
                </span>
              </div>
              <h2 className="text-lg font-black">Where should you expand next?</h2>
              <p className="text-white/60 text-sm mt-0.5">
                Based on your coverage, your sales, and what the rest of the network is missing.
              </p>
            </div>
            <Button
              onClick={fetchAiSuggestions}
              disabled={aiLoading}
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-[#0B1F3B] font-bold gap-2"
            >
              {aiLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</>
                : <><Sparkles className="w-4 h-4" /> {aiSuggestions.length ? "Refresh" : "Get Suggestions"}</>
              }
            </Button>
          </div>

          {aiSuggestions.length > 0 && (
            <div className="relative mt-5 grid sm:grid-cols-3 gap-3">
              {aiSuggestions.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{s.region}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      s.opportunity_level === "high"
                        ? "bg-green-400/20 text-green-300 border border-green-400/30"
                        : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    }`}>
                      {s.opportunity_level === "high" ? "★ High" : "Good"}
                    </span>
                  </div>
                  <p className="text-white/75 text-xs leading-relaxed mb-3">{s.reason}</p>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-xs font-semibold text-amber-300 mb-1">This week:</p>
                    <p className="text-white/70 text-xs leading-relaxed">{s.first_step}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedRegion(s.region); setTemplateVisible(false); }}
                    className="mt-3 w-full text-xs font-bold py-1.5 rounded-lg bg-amber-400 text-[#0B1F3B] hover:bg-amber-300 transition-colors"
                  >
                    Get email template →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Gap Analysis */}
          <div className="md:col-span-2 space-y-6">
            {/* Uncovered regions */}
            <div className="bg-card border rounded-xl p-5">
              <h2 className="font-semibold mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Areas With No Distributor Yet ({gaps.length})
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Nobody covers these areas — great chance to be first</p>
              {gaps.length === 0 ? (
                <p className="text-sm text-green-600">All regions are covered!</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gaps.map(region => (
                    <button
                      key={region.name}
                      onClick={() => { setSelectedRegion(region.name); setTemplateVisible(false); }}
                      className={`border rounded-lg p-3 text-left transition-all hover:shadow-sm ${
                        selectedRegion === region.name
                          ? "border-[#0B1F3B] bg-[#0B1F3B]/5 ring-2 ring-[#0B1F3B]"
                          : "border-dashed border-red-200 bg-red-50 dark:bg-red-900/10"
                      }`}
                    >
                      <span className="text-lg">{region.flag}</span>
                      <p className="text-xs font-medium mt-1">{region.name}</p>
                      <p className="text-xs text-red-600">Uncovered</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Low coverage */}
            {lowCoverage.length > 0 && (
              <div className="bg-card border rounded-xl p-5">
                <h2 className="font-semibold mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" />
                  Areas With Only One Distributor ({lowCoverage.length})
                </h2>
                <p className="text-xs text-muted-foreground mb-4">There's only one person covering these — there's room for you too</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {lowCoverage.map(region => (
                    <button
                      key={region.name}
                      onClick={() => { setSelectedRegion(region.name); setTemplateVisible(false); }}
                      className={`border rounded-lg p-3 text-left transition-all hover:shadow-sm ${
                        selectedRegion === region.name
                          ? "border-[#0B1F3B] bg-[#0B1F3B]/5 ring-2 ring-[#0B1F3B]"
                          : "border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                      }`}
                    >
                      <span className="text-lg">{region.flag}</span>
                      <p className="text-xs font-medium mt-1">{region.name}</p>
                      <p className="text-xs text-amber-600">1 distributor</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outreach template */}
            {selectedRegion && (
              <div className="bg-card border border-[#0B1F3B]/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#0B1F3B]" />
                    Ready-Made Email — {selectedRegion}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setTemplateVisible(v => !v)}
                    >
                      {templateVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {templateVisible ? "Hide" : "Show"} Email
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white"
                      onClick={handleCopy}
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                {templateVisible && (
                  <pre className="text-xs bg-muted/50 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed mb-4">
                    {template}
                  </pre>
                )}

                {/* Log outreach */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Record that you've contacted someone here</p>
                  <div className="flex gap-2">
                    <Input
                      value={logNote}
                      onChange={e => setLogNote(e.target.value)}
                      placeholder={`e.g. "Emailed Marine Supplies Ltd on Monday"`}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleLogOutreach}
                      disabled={logging}
                      className="bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white gap-1 shrink-0"
                    >
                      {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loggedRegion === selectedRegion ? "Saved!" : "Save Note"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* My coverage */}
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B1F3B]" /> Your Areas
              </h3>
              {myAreas.length === 0 ? (
                <p className="text-xs text-muted-foreground">You haven't set your areas yet. Update your profile.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {myAreas.map((area: string) => (
                    <span key={area} className="text-xs bg-[#0B1F3B]/10 text-[#0B1F3B] px-2 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Outreach log history */}
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold mb-3">Who I've Contacted</h3>
              {outreachLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nothing recorded yet. Pick an area above and save a note after you make contact.</p>
              ) : (
                <div className="space-y-2">
                  {outreachLogs.map(log => (
                    <div key={log.id} className="text-xs border rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium">{log.region}</span>
                        <span className="text-muted-foreground">{new Date(log.created_at).toLocaleDateString("en-GB")}</span>
                      </div>
                      {log.notes && <p className="text-muted-foreground">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Quick Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-700">Areas with nobody</span>
                  <span className="font-bold text-red-600">{gaps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Areas with one person</span>
                  <span className="font-bold text-amber-600">{lowCoverage.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Contacts recorded</span>
                  <span className="font-bold text-green-600">{outreachLogs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

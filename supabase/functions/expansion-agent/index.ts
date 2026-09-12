import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { distributorId } = await req.json();
    if (!distributorId) {
      return new Response(JSON.stringify({ error: "Missing distributorId" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Fetch this distributor's data
    const { data: me } = await supabase
      .from("distributors")
      .select("company_name, location, coverage_areas, specializations, commission_rate")
      .eq("id", distributorId)
      .maybeSingle();

    if (!me) {
      return new Response(JSON.stringify({ error: "Distributor not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Fetch all approved distributors to build a network coverage picture
    const { data: allDist } = await supabase
      .from("distributors")
      .select("coverage_areas, specializations, location")
      .eq("status", "approved")
      .neq("id", distributorId);

    // Count how many distributors cover each region
    const regionCoverage: Record<string, number> = {};
    (allDist || []).forEach((d: { coverage_areas?: string[] }) => {
      (d.coverage_areas || []).forEach((r: string) => {
        regionCoverage[r] = (regionCoverage[r] || 0) + 1;
      });
    });

    // Fetch top-selling products through this distributor (for context)
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, products:product_id(domain_category)")
      .eq("distributor_id", distributorId)
      .eq("status", "completed")
      .limit(50);

    const categorySales: Record<string, number> = {};
    (orders || []).forEach((o: any) => {
      const cat = o.products?.domain_category || "other";
      categorySales[cat] = (categorySales[cat] || 0) + (o.total_amount || 0);
    });

    const topCategories = Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Build a structured prompt for Claude
    const uncoveredRegions = Object.entries(regionCoverage)
      .filter(([r, c]) => c === 0 && !(me.coverage_areas || []).includes(r))
      .map(([r]) => r);

    const lowCoverageRegions = Object.entries(regionCoverage)
      .filter(([r, c]) => c === 1 && !(me.coverage_areas || []).includes(r))
      .map(([r]) => r);

    const prompt = `You are an expert maritime industry business development consultant.

A marine equipment distributor called "${me.company_name}" is based in ${me.location || "an unspecified location"}.
They currently cover these regions: ${(me.coverage_areas || []).join(", ") || "none listed"}.
Their specialisations: ${(me.specializations || []).join(", ") || "general marine equipment"}.
Their commission rate: ${me.commission_rate}%.

Network context:
- Regions with NO distributor yet: ${uncoveredRegions.join(", ") || "none"}
- Regions with only ONE distributor: ${lowCoverageRegions.join(", ") || "none"}
- This distributor's top revenue categories: ${topCategories.join(", ") || "not yet established"}

Based on this data, provide 3 specific expansion recommendations. For each one:
1. Name the region to target
2. Explain WHY it's a good match for this distributor specifically (1-2 sentences)
3. Give one concrete first step they can take this week

Keep the language simple — this is a small harbour shop owner, not a corporate executive. Be direct and encouraging.

Return a JSON array of 3 objects with these keys:
- region (string)
- reason (string, 1-2 sentences, plain English)
- first_step (string, one actionable sentence)
- opportunity_level ("high" | "medium") based on competition and fit`;

    // Call Gemini API (gemini-2.0-flash)
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      // Fallback: return rule-based suggestions when no API key
      const suggestions = buildRuleBasedSuggestions(uncoveredRegions, lowCoverageRegions);
      return new Response(JSON.stringify({ suggestions, ai: false }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
        }),
      }
    );

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Gemini API error:", errText);
      const suggestions = buildRuleBasedSuggestions(uncoveredRegions, lowCoverageRegions);
      return new Response(JSON.stringify({ suggestions, ai: false }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const rawText: string = aiJson.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Extract JSON array from Claude's response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ suggestions, ai: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    console.error("Expansion agent error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

// Rule-based fallback when no API key is set
function buildRuleBasedSuggestions(
  uncovered: string[],
  lowCoverage: string[]
): Array<{ region: string; reason: string; first_step: string; opportunity_level: "high" | "medium" }> {
  const suggestions = [];
  for (const region of uncovered.slice(0, 2)) {
    suggestions.push({
      region,
      reason: `Nobody is covering ${region} yet on Ocean Hotspot. You'd be the first mover, which means you get first pick of the customers there.`,
      first_step: `Contact three local marinas or boatyards in ${region} this week and introduce yourself as the Ocean Hotspot distributor for their area.`,
      opportunity_level: "high" as const,
    });
  }

  for (const region of lowCoverage.slice(0, 3 - suggestions.length)) {
    suggestions.push({
      region,
      reason: `Only one other distributor covers ${region} right now. A second option gives customers choice and you a fair share of that market.`,
      first_step: `List your best-selling products as available in ${region} and add it to your coverage areas in your profile.`,
      opportunity_level: "medium" as const,
    });
  }

  return suggestions.slice(0, 3);
}

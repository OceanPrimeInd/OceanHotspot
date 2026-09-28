#!/usr/bin/env node
/** Re-assign domain_category from title/brand keywords (fixes bulk import mis-tags). */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const SLUG_KEYWORDS = {
  vessels: ["yacht", "boat", "rib", "catamaran", "tender", "dinghy", "vessel", "pontoon"],
  engines: [
    "webasto",
    "heater",
    "generator",
    "fischer panda",
    "exhaust",
    "thruster",
    "sleipner",
    "engine",
    "propeller",
    "bow thruster",
    "air conditioning",
    "cool vx",
  ],
  electronics: ["chartplotter", "gps", "radar", "ais", "vhf", "simrad", "garmin", "raymarine"],
  electrical: ["solar", "battery", "charge controller", "mppt", "inverter", "victron", "shore power"],
  deck: ["anchor", "windlass", "fender", "mooring", "cleat", "hatch", "deck", "winch"],
  pumps: ["pump", "bilge", "watermaker", "plumbing", "toilet", "macerator"],
  maintenance: ["paint", "antifoul", "cleaner", "anode", "service kit", "filter", "oil"],
  safety: ["life jacket", "liferaft", "epirb", "flare", "fire extinguisher"],
  leisure: ["towable", "kayak", "paddle", "fishing", "watersport"],
};

function inferSlug(row) {
  const text = [row.title, row.description, row.brand, row.part_number]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const [slug, keywords] of Object.entries(SLUG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return slug;
  }
  return row.domain_category || "maintenance";
}

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  const fromFile = fs.existsSync(file)
    ? Object.fromEntries(
        fs
          .readFileSync(file, "utf8")
          .split("\n")
          .filter((l) => l && !l.startsWith("#"))
          .map((l) => {
            const i = l.indexOf("=");
            return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
          }),
      )
    : {};
  return { ...fromFile, ...process.env };
}

function resolveServiceRoleKey(env) {
  if (env.SUPABASE_SERVICE_ROLE_KEY) return env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) return null;
  try {
    const json = execSync(`supabase projects api-keys --project-ref ${ref} -o json`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(json).find((k) => k.name === "service_role")?.api_key ?? null;
  } catch {
    return null;
  }
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = resolveServiceRoleKey(env);
if (!url || !key) {
  console.error("Need SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or Supabase CLI login)");
  process.exit(1);
}

const sb = createClient(url, key);
const { data: rows, error } = await sb.from("products").select("id, title, description, brand, part_number, domain_category");
if (error) throw error;

let updated = 0;
for (const row of rows) {
  const next = inferSlug(row);
  if (next !== row.domain_category) {
    const { error: upErr } = await sb.from("products").update({ domain_category: next }).eq("id", row.id);
    if (upErr) console.warn(row.id, upErr.message);
    else updated++;
  }
}
console.log(`Retagged ${updated} / ${rows.length} products`);

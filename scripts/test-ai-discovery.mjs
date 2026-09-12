#!/usr/bin/env node
/**
 * Run 10 buyer-style questions against ai-discovery and verify every returned
 * product id exists as is_published in Supabase (no invented listings).
 *
 * Usage:
 *   npm run test:discovery          → deployed Supabase ai-discovery (no dev server)
 *   npm run test:discovery:local    → http://localhost:3000/api/discovery (needs npm run dev)
 *   node scripts/test-ai-discovery.mjs <custom-url>
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and anon key.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const BUYER_QUESTIONS = [
  "I need a bow thruster for my 40ft motor yacht — what do you have in stock?",
  "Looking for a rugged Android tablet for the helm, waterproof if possible",
  "Do you sell GPS chartplotters for coastal navigation?",
  "We need ISO-approved life jackets for 6 crew members",
  "12V bilge pump for a small sailboat",
  "Electric anchor windlass recommendation under £2000",
  "Fixed mount VHF radio for the bridge",
  "Antifouling paint for a 10m hull, Mediterranean use",
  "Dock fenders and lines for a 12m boat",
  "Engine oil suitable for Volvo Penta diesel",
];

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or anon key in .env.local");
  process.exit(1);
}

const edgeUrl = `${url.replace(/\/$/, "")}/functions/v1/ai-discovery`;
const localUrl = "http://127.0.0.1:3000/api/discovery";

const fnUrl =
  process.argv[2] ||
  process.env.DISCOVERY_TEST_URL ||
  edgeUrl;

async function fetchPublishedIds() {
  const res = await fetch(
    `${url}/rest/v1/products?select=id,title&is_published=eq.true`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const rows = await res.json();
  return new Map(rows.map((r) => [r.id, r.title]));
}

function discoveryHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (fnUrl.includes("/functions/v1/")) {
    headers.apikey = key;
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

async function ask(question) {
  let res;
  try {
    res = await fetch(fnUrl, {
      method: "POST",
      headers: discoveryHeaders(),
      body: JSON.stringify({
        messages: [{ role: "user", content: question }],
      }),
    });
  } catch (err) {
    const hint =
      fnUrl.includes("localhost") || fnUrl.includes("127.0.0.1")
        ? `\nStart the app first: npm run dev\nOr test the deployed function: npm run test:discovery`
        : `\nCheck network and Supabase URL in .env.local`;
    throw new Error(`Could not reach ${fnUrl}${hint}\n(${err.message})`);
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const published = await fetchPublishedIds();
console.log(`Endpoint: ${fnUrl}`);
console.log(`Published products in catalog: ${published.size}\n`);

let failures = 0;
const rows = [];

for (let i = 0; i < BUYER_QUESTIONS.length; i++) {
  const q = BUYER_QUESTIONS[i];
  const { ok, status, data } = await ask(q);
  const products = data.products || [];
  const invalid = products.filter((p) => !published.has(p.id));
  const invented = invalid.length > 0;
  if (!ok || invented) failures++;

  rows.push({
    n: i + 1,
    ok: ok && !invented,
    status,
    count: products.length,
    keywords: (data.keywords || []).join(", "),
    sample: products[0]?.title || "—",
    invalid: invalid.map((p) => p.id).join(" ") || "—",
  });

  console.log(`#${i + 1} ${ok && !invented ? "PASS" : "FAIL"} (${products.length} products)`);
  console.log(`   Q: ${q.slice(0, 72)}…`);
  console.log(`   Keywords: ${(data.keywords || []).join(", ") || "—"}`);
  if (products.length) {
    for (const p of products.slice(0, 3)) {
      const live = published.has(p.id) ? "live" : "INVENTED";
      console.log(`   - [${live}] ${p.title}`);
    }
  } else {
    console.log(`   Reply: ${(data.reply || "").slice(0, 100)}`);
  }
  if (invented) console.log(`   !! Invalid ids: ${invalid.map((p) => p.id).join(", ")}`);
  console.log("");
}

console.log("--- Summary ---");
console.table(rows);
console.log(failures === 0 ? "All questions: no invented product IDs." : `${failures} question(s) failed.`);
process.exit(failures === 0 ? 0 : 1);

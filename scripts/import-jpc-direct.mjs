#!/usr/bin/env node
/**
 * Scrape JPC Direct (WooCommerce) and import into Ocean Hotspot for one seller showroom.
 * Permission: only run when JPC Direct has agreed (supplier onboarding).
 *
 * Usage:
 *   node scripts/import-jpc-direct.mjs --scrape-only [--limit N]
 *   node scripts/import-jpc-direct.mjs --from-cache   (skip re-scrape; use data/jpc-direct-products.json)
 *   node scripts/import-jpc-direct.mjs --create-seller  (auth user shop@jpcdirect.com if missing)
 *   node scripts/import-jpc-direct.mjs --dry-run [--limit N]
 *   node scripts/import-jpc-direct.mjs [--limit N]
 *
 * Env (from .env.local or shell):
 *   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   JPC_SELLER_ID  (optional uuid — else looks up profile company_name JPC Direct)
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SITEMAP = "https://www.jpcdirect.com/product-sitemap.xml";
const SHOWROOM_SLUG = "jpc-direct";
const SCRAPE_OUT = path.join("data", "jpc-direct-products.json");
const CONCURRENCY = 6;

const args = process.argv.slice(2);
const scrapeOnly = args.includes("--scrape-only");
const fromCache = args.includes("--from-cache");
const createSeller = args.includes("--create-seller");
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0;

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
      }),
  );
}

function parseProductJsonLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map(
    (m) => m[1],
  );
  for (const raw of blocks) {
    try {
      const j = JSON.parse(raw);
      const graph = j["@graph"] || [j];
      const product = graph.find((n) => n["@type"] === "Product");
      if (product) return product;
    } catch {
      /* skip */
    }
  }
  return null;
}

function parseExVatPrice(html, incVat) {
  const exMatch = html.match(
    /ex vat[\s\S]{0,120}?woocommerce-Price-amount amount"><bdi>[\s\S]*?([0-9][0-9,]*\.?[0-9]*)/i,
  );
  if (exMatch) return parseFloat(exMatch[1].replace(/,/g, ""));
  if (incVat > 0) return Math.round((incVat / 1.2) * 100) / 100;
  return 0;
}

function parseIncVatFromOffer(product) {
  const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
  const spec = offer?.priceSpecification?.[0] || offer?.priceSpecification;
  const price = parseFloat(spec?.price ?? offer?.price ?? "0");
  return Number.isFinite(price) ? price : 0;
}

function guessDomainCategory(html, title) {
  const t = `${title} ${html}`.toLowerCase();
  if (/generator|webasto|heater|exhaust|fischer panda|engine|propulsion/.test(t)) return "engines";
  if (/solar|battery|charge controller|inverter|electrical|victron|mppt/.test(t)) return "electrical";
  if (/pump|bilge|watermaker|plumbing/.test(t)) return "pumps";
  if (/radar|gps|chartplotter|simrad|garmin|raymarine|electronics/.test(t)) return "electronics";
  if (/lifejacket|flare|safety|fire/.test(t)) return "safety";
  if (/deck|anchor|windlass|rope|fender/.test(t)) return "deck";
  if (/air.?condition|cool|hvac/.test(t)) return "engines";
  return "maintenance";
}

function guessBrand(title) {
  const brands = [
    "Webasto",
    "Fischer Panda",
    "Victron",
    "PV Logic",
    "Sleipner",
    "Dometic",
    "Whale",
    "Garmin",
  ];
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b;
  }
  return "JPC Direct";
}

function stripHtml(text) {
  return (text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "OceanHotspotImporter/1.0 (+https://oceanhotspot.com)" },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

async function getProductUrls() {
  const xml = await fetchText(SITEMAP);
  const urls = [...xml.matchAll(/<loc>(https:\/\/www\.jpcdirect\.com\/product\/[^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );
  return [...new Set(urls)];
}

async function scrapeProduct(url) {
  const html = await fetchText(url);
  const product = parseProductJsonLd(html);
  if (!product?.name) throw new Error("No Product JSON-LD");

  const incVat = parseIncVatFromOffer(product);
  const exVat = parseExVatPrice(html, incVat);
  let sku = (product.sku || "").trim();
  if (!sku) {
    const slugMatch = url.match(/\/product\/([^/]+)\/?$/);
    sku = slugMatch ? slugMatch[1].slice(0, 64) : "";
  }
  const image = typeof product.image === "string" ? product.image : product.image?.[0] || null;
  const description = stripHtml(product.description || "").slice(0, 8000);
  const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
  const inStock =
    offer?.availability === "https://schema.org/InStock" ||
    String(offer?.availability || "").includes("InStock");

  return {
    source_url: url,
    title: product.name.trim(),
    part_number: sku || null,
    description,
    price: exVat,
    currency: "GBP",
    image_url: image,
    brand: guessBrand(product.name),
    domain_category: guessDomainCategory(html, product.name),
    entity_type: "physical_product",
    vat_treatment: "plus_vat",
    vat_rate: 20,
    availability_status: inStock ? "in_stock" : "made_to_order",
    condition: "new",
    pricing_type: "fixed_price",
    supplier_note: `Imported from JPC Direct with permission. Original: ${url}`,
  };
}

async function poolMap(items, fn, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = { ok: true, value: await fn(items[idx], idx) };
      } catch (e) {
        results[idx] = { ok: false, error: e.message, url: items[idx] };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function resolveSellerId(supabase, env, allowCreate) {
  if (env.JPC_SELLER_ID) return env.JPC_SELLER_ID;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, company_name")
    .or("company_name.ilike.%JPC Direct%,trading_name.ilike.%JPC Direct%")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id;

  if (!allowCreate) {
    throw new Error(
      "No JPC seller profile found. Run with --create-seller or set JPC_SELLER_ID.",
    );
  }

  const email = env.JPC_SELLER_EMAIL || "shop@jpcdirect.com";
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: "JPC Direct" },
  });
  if (createErr && !/already been registered/i.test(createErr.message)) throw createErr;

  let userId = created?.user?.id;
  if (!userId) {
    const { data: listed, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 500 });
    if (listErr) throw listErr;
    userId = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  }
  if (!userId) throw new Error("Could not resolve JPC seller user id");

  await supabase.from("profiles").upsert({
    id: userId,
    company_name: "JPC Direct",
    trading_name: "JPC Direct",
    is_seller: true,
  });

  console.log(`Created/found seller ${email} → ${userId}`);
  return userId;
}

async function ensureShowroom(supabase, sellerId, dry) {
  const { data: existing } = await supabase
    .from("showrooms")
    .select("id, slug")
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existing) return existing;

  const payload = {
    seller_id: sellerId,
    brand_name: "JPC Direct",
    slug: SHOWROOM_SLUG,
    tagline: "Leading suppliers and installers of marine systems",
    about_text:
      "JPC Direct supply and install marine heating, power, air conditioning and more from Norfolk. " +
      "Browse their range on Ocean Hotspot — pricing ex VAT unless stated.",
    logo_url: "https://www.jpcdirect.com/wp-content/uploads/2024/05/logo.png",
    website_url: "https://www.jpcdirect.com/",
    contact_email: "shop@jpcdirect.com",
    contact_phone: "01603 784884",
    location: "Riverside Estate, Brundall, Norfolk NR13 5PL",
    is_published: true,
  };

  if (dry) {
    console.log("[dry-run] Would create showroom", payload.slug);
    return { id: "dry-run", slug: SHOWROOM_SLUG };
  }

  const { data, error } = await supabase.from("showrooms").insert(payload).select("id, slug").single();
  if (error) throw error;
  return data;
}

async function upsertProduct(supabase, sellerId, row, dry) {
  const base = {
    seller_id: sellerId,
    title: row.title,
    part_number: row.part_number,
    description: row.description,
    price: row.price,
    currency: row.currency,
    image_url: row.image_url,
    images: row.image_url ? [row.image_url] : null,
    brand: row.brand,
    domain_category: row.domain_category,
    entity_type: row.entity_type,
    vat_treatment: row.vat_treatment,
    vat_rate: row.vat_rate,
    availability_status: row.availability_status,
    condition: row.condition,
    pricing_type: row.pricing_type,
    supplier_note: row.supplier_note,
    status: "active",
    is_published: true,
  };

  if (dry) return { action: "dry-run", title: row.title };

  if (row.part_number) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", sellerId)
      .eq("part_number", row.part_number)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase.from("products").update(base).eq("id", existing.id);
      if (error) throw error;
      return { action: "updated", id: existing.id };
    }
  }

  const { data, error } = await supabase.from("products").insert(base).select("id").single();
  if (error) throw error;
  return { action: "inserted", id: data.id };
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  let products = [];
  let failures = [];

  if (fromCache && fs.existsSync(SCRAPE_OUT)) {
    const cached = JSON.parse(fs.readFileSync(SCRAPE_OUT, "utf8"));
    products = cached.products || [];
    console.log(`Loaded ${products.length} products from ${SCRAPE_OUT}`);
    if (limit > 0) products = products.slice(0, limit);
  } else {
    let urls = await getProductUrls();
    console.log(`Found ${urls.length} product URLs in sitemap`);
    if (limit > 0) urls = urls.slice(0, limit);

    console.log(`Scraping ${urls.length} products (concurrency ${CONCURRENCY})…`);
    const scraped = await poolMap(urls, scrapeProduct, CONCURRENCY);
    products = scraped.filter((r) => r.ok).map((r) => r.value);
    failures = scraped.filter((r) => !r.ok);

    fs.mkdirSync(path.dirname(SCRAPE_OUT), { recursive: true });
    fs.writeFileSync(
      SCRAPE_OUT,
      JSON.stringify({ scraped_at: new Date().toISOString(), products, failures }, null, 2),
    );
    console.log(`Saved ${products.length} products → ${SCRAPE_OUT}`);
    if (failures.length) console.warn(`${failures.length} scrape failures (see JSON)`);
  }

  if (scrapeOnly) return;

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add to .env.local or run:\n" +
        "  SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-jpc-direct.mjs",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const sellerId = await resolveSellerId(supabase, env, createSeller);
  console.log(`Seller id: ${sellerId}`);

  const showroom = await ensureShowroom(supabase, sellerId, dryRun);
  console.log(`Showroom: /showroom/${showroom.slug}`);

  await supabase
    .from("profiles")
    .update({ is_seller: true, company_name: "JPC Direct" })
    .eq("id", sellerId);

  let inserted = 0;
  let updated = 0;
  let importFailed = 0;

  for (const row of products) {
    if (row.price <= 0) {
      importFailed++;
      continue;
    }
    try {
      const result = await upsertProduct(supabase, sellerId, row, dryRun);
      if (result.action === "inserted") inserted++;
      else if (result.action === "updated") updated++;
    } catch (e) {
      importFailed++;
      console.warn(`Import failed: ${row.title} — ${e.message}`);
    }
  }

  console.log(
    dryRun
      ? `[dry-run] Would import ${products.length} products`
      : `Done. inserted=${inserted} updated=${updated} failed=${importFailed}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
/** Smoke-test legal/info routes return 200. Usage: node scripts/test-legal-pages.mjs [baseUrl] */

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");

const routes = [
  "/terms",
  "/privacy",
  "/cookies",
  "/returns",
  "/buyer-protection",
  "/help",
  "/contact",
];

let failed = 0;
for (const path of routes) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url);
    const ok = res.ok;
    if (!ok) failed++;
    console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${path}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${path} — ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);

#!/usr/bin/env node
/** Smoke-test App Router pages return <400. Usage: node scripts/smoke-routes.mjs [baseUrl] */

import fs from "fs";
import path from "path";

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const appDir = "src/app";

const routes = [];
function walkApp(dir, prefix = "") {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name.startsWith("(") || ent.name.startsWith("_")) continue;
      if (ent.name.startsWith("[")) {
        const sample =
          ent.name === "[id]"
            ? "sample-id"
            : ent.name === "[slug]"
              ? "sample-slug"
              : ent.name === "[orderId]"
                ? "sample-order"
                : ent.name === "[productId]"
                  ? "sample-product"
                  : "sample";
        const segmentPrefix = `${prefix}/${sample}`;
        const hasPageHere = fs.existsSync(path.join(p, "page.tsx"));
        if (hasPageHere) routes.push(segmentPrefix);
        walkApp(p, segmentPrefix);
      } else {
        walkApp(p, `${prefix}/${ent.name}`);
      }
    } else if (ent.name === "page.tsx") {
      routes.push(prefix || "/");
    }
  }
}
walkApp(appDir);

let failed = 0;
for (const route of routes.sort()) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const ok = res.status < 400;
    if (!ok) failed++;
    console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${route}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${route} — ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);

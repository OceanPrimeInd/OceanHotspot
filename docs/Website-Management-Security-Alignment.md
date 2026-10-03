# Ocean Hotspot — Website Management & Security Alignment

**Document type:** Security baseline response  
**Reference:** *Website Management–Security V1* (30 September 2026)  
**Product:** [Ocean Hotspot](https://www.oceanhotspot.com) — maritime marketplace  
**Organisation:** Ocean Prime  
**Prepared:** 1 October 2026  
**Author:** Engineering (Jayani Bhatwadiya)  
**Version:** 1.0  

---

## 1. Executive summary

Ocean Hotspot is **not** a traditional CMS site (WordPress/Shopify). It is a **custom web application** built with **Next.js**, hosted on **Vercel**, with data and authentication on **Supabase** (PostgreSQL, Auth, Storage, Edge Functions). Payments use **Stripe** when checkout is enabled.

The requirements in *Website Management–Security V1* still apply in principle. This document maps each requirement to **how we implement or inherit it**, current **status**, **evidence**, and **planned improvements**. Overall posture: **strong on transport encryption and data access control**; **gaps to close on formal CSP, documented WAF ownership, and phishing-resistant MFA on all administrative accounts**.

---

## 2. Platform overview

| Layer | Technology | Role |
|--------|------------|------|
| Public website | Next.js 15 (App Router) | Storefront, browse, product detail, seller/admin portals |
| Hosting | Vercel | HTTPS, CDN, preview/staging deploys from Git |
| Database & auth | Supabase | Users, products, orders, RLS policies, backups (plan-dependent) |
| Payments | Stripe | Checkout (when `NEXT_PUBLIC_SHOP_OPEN` / checkout enabled) |
| Email | Gmail SMTP + Edge Functions | Transactional and notification mail |
| Source control | GitHub (`OceanPrimeInd/OceanHotspot`) | Code history, CI build on PR/main |
| CI | GitHub Actions | `npm ci` + production build on push/PR |

**Production URL:** `https://www.oceanhotspot.com`  
**Operational docs (internal):** `docs/STAGING_AND_ROLLBACK.md`, `docs/EMAIL_SETUP.md`

---

## 3. Alignment with essential security requirements

Legend: **Implemented** · **Partial** · **Planned** · **Inherited** (from platform provider)

| # | Requirement (from V1 brief) | Status | How Ocean Hotspot meets it | Evidence / notes | Recommended next step |
|---|-----------------------------|--------|---------------------------|------------------|------------------------|
| 1 | **Transport Layer Security (HTTPS)** | **Implemented** | Vercel serves the site over HTTPS; browsers use TLS to Supabase and Stripe APIs. | Live site uses `https://`; no mixed-content payment flows in app code. | Enable **HSTS** and redirect `http→https` at domain/DNS level if not already enforced in Vercel project settings. |
| 2 | **Web Application Firewall (WAF)** | **Partial / Inherited** | Edge protection is primarily **Vercel’s network** (DDoS mitigation, TLS termination). No separate WAF product is configured in-repo. | Application uses **parameterised Supabase client** and **RLS** rather than raw SQL from the browser. | Confirm with IT whether **Cloudflare (or Vercel Firewall/WAF add-on)** is required for compliance; document owner and SLA. |
| 3 | **Phishing-resistant MFA (admin)** | **Partial** | **Supabase Dashboard**, **GitHub**, and **Vercel** support MFA (including WebAuthn on those platforms). In-app admin uses Supabase Auth + `has_role(..., 'admin')` in database policies. | RLS on sensitive tables; admin routes gated in application. | **Mandatory MFA policy** for all accounts with production access (Supabase org, GitHub org, Vercel team). Prefer **hardware keys / WebAuthn** over SMS. |
| 4 | **Regular software & dependency updates** | **Partial** | Node/npm dependencies in `package.json`; **GitHub Actions CI** runs build on `main`, `staging`, and PRs. No WordPress-style plugins. | `.github/workflows/ci.yml` | Add **Dependabot or scheduled npm audit**; define **monthly patch window** and owner. |
| 5 | **Automated backups & recovery** | **Partial** | **Supabase** provides automated backups on paid tiers; **manual SQL dump** script documented. **Git** is the backup for application code; Vercel retains deploy history for rollback. | `scripts/backup-supabase.sh`, `docs/STAGING_AND_ROLLBACK.md` | Confirm **Supabase backup/PITR tier** on project `coredymzvknvaddplcjj`; schedule **pre–go-live snapshot**; test restore once per quarter. |
| 6 | **Content Security Policy (CSP)** | **Planned** | Security headers/CSP are **not yet defined** in `next.config.ts`. Third parties in use: Supabase, Stripe, analytics, supplier image URLs (e.g. CDN), WhatsApp links. | Current Next config sets image domains only. | Implement **CSP + security headers** in Next.js (report-only first, then enforce); allow-list Stripe, Supabase, and required asset hosts. |

---

## 4. Additional controls (beyond the one-page brief)

These are standard for our stack and support the same security goals:

| Control | Status | Detail |
|---------|--------|--------|
| **Row Level Security (RLS)** | Implemented | PostgreSQL policies restrict data by role (buyer, seller, admin); migrations under `supabase/migrations/`. |
| **Secrets handling** | Implemented | `SUPABASE_SERVICE_ROLE_KEY` and payment keys are **server/Edge only**; CI uses placeholders. `.env.local` is not committed. |
| **Authentication** | Implemented | Supabase Auth for buyers/sellers; admin role in database. |
| **Cookie / privacy** | Implemented | Cookie consent and privacy/erasure flows (GDPR-oriented pages). |
| **Staging & rollback** | Documented | Staging branch + Vercel previews; rollback procedure in `docs/STAGING_AND_ROLLBACK.md`. |
| **Supplier catalogue import** | Operational | JPC Direct import via controlled script with seller permission; no public scrape endpoints. |

---

## 5. Administrative access register (to be completed with IT)

Please keep this table updated in the company password manager / IT ticket system.

| System | Purpose | Who needs access | MFA required | MFA type target |
|--------|---------|------------------|--------------|-----------------|
| Supabase (production project) | DB, Auth, Storage, Functions | Engineering lead, designated admin | Yes | WebAuthn / TOTP |
| Vercel | Production deploy, env vars | Engineering, release owner | Yes | WebAuthn / TOTP |
| GitHub `OceanPrimeInd` | Source code, CI | Developers with merge rights | Yes | WebAuthn |
| Stripe Dashboard | Payments & refunds | Finance + engineering | Yes | WebAuthn |
| Domain / DNS registrar | `oceanhotspot.com` | IT / domain owner | Yes | WebAuthn |

---

## 6. Risk summary & 90-day roadmap

**Current risks (honest assessment)**

1. **CSP not enforced** — XSS impact depends on third-party scripts and user-generated content; mitigation planned via headers.  
2. **WAF not explicitly contracted** — reliance on host defaults; may not satisfy auditors without a named product/owner.  
3. **MFA is policy-dependent** — technical capability exists on platforms; enforcement is organisational.  
4. **Migration history** — Supabase local/remote migration sync should be kept aligned before schema changes (operational, not customer-facing).

**Proposed 90-day actions**

| Priority | Action | Owner | Target |
|----------|--------|-------|--------|
| P1 | Enforce MFA on Supabase, GitHub, Vercel for all production access | IT + Engineering | 2 weeks |
| P1 | Confirm Supabase backup/PITR and document RPO/RTO | Engineering | 2 weeks |
| P2 | Add CSP (report-only → enforce) and security headers in Next.js | Engineering | 4–6 weeks |
| P2 | Dependabot + monthly dependency review | Engineering | 4 weeks |
| P3 | Decision: Cloudflare or Vercel Advanced Firewall for WAF | IT / Management | 8 weeks |
| P3 | Quarterly backup restore drill | Engineering | Ongoing |

---

## 7. Conclusion

Ocean Hotspot aligns with the **intent** of *Website Management–Security V1*: encrypted transport, protected backend access, patchable codebase, and recoverable data. Because the product is a **managed custom application**, “plugin updates” are replaced by **dependency and deployment discipline**. The main items to **close for full alignment** are: **documented WAF responsibility**, **CSP/security headers in the application**, and **organisation-wide phishing-resistant MFA** on every account that can change production.

For questions or sign-off, contact the engineering owner listed above.

---

## Appendix A — Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 1 Oct 2026 | Initial alignment to Website Management–Security V1 |

## Appendix B — Exporting this document as PDF

From the project root (optional):

```bash
# If you use Cursor/gstack PDF tooling on this file:
# /make-pdf docs/Website-Management-Security-Alignment.md
```

Alternatively: open this file in VS Code/Cursor → **Markdown: Export to PDF**, or paste into Google Docs/Word and export PDF for formal submission.

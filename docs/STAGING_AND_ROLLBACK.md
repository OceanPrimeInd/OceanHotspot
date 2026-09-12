# Staging, backup, and rollback (Ocean Hotspot)

Use this during show week and any high-traffic period so fixes are tested before production and you can recover quickly.

## Staging environment (recommended)

### Frontend (Vercel)

1. In [Vercel](https://vercel.com) → your Ocean Hotspot project → **Settings → Git**:
   - **Production branch:** `main` (or your live branch).
   - Create a long-lived branch `staging` and enable **Preview** deployments for it.
2. Add a **Preview** environment variable set (same keys as production, different values where needed):
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` → point at a **staging Supabase project** (see below), not production.
   - `NEXT_PUBLIC_APP_ENV=staging` (optional banner in UI).
3. Workflow:
   - Push fixes to `staging` → Vercel gives a stable preview URL (e.g. `ocean-hotspot-git-staging-….vercel.app`).
   - QA checkout, seller dashboard, admin on that URL.
   - Merge `staging` → `main` when verified.

Every **pull request** also gets its own preview URL — good for one-off fixes.

### Backend (Supabase)

Best practice: a **second Supabase project** named e.g. `ocean-hotspot-staging`:

- Copy schema: run the same migrations (`supabase db push` against staging project).
- Use **Stripe test mode** keys and a separate test webhook endpoint on staging.
- Set staging secrets: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `SITE_URL` (staging Vercel URL), `STRIPE_SECRET_KEY` (test), `CONTACT_EMAIL=oceanhotspotservices@gmail.com`.

Add staging origins to edge functions (Supabase → Edge Functions secrets):

```bash
ALLOWED_ORIGINS=https://your-staging.vercel.app,http://localhost:3000
```

(`ALLOWED_ORIGINS` is read by `supabase/functions/_shared/cors.ts`.)

Deploy functions to **each** project with `./scripts/deploy-edge-functions.sh` after linking the correct project.

### Local smoke test

```bash
cp .env.example .env.local   # fill in keys
npm run dev
npm run build
```

## Backup

### Database (Supabase)

**Dashboard (fastest):** Project → **Database** → **Backups** (daily on paid plans; take a manual snapshot before show week if available).

**CLI dump (portable SQL file):**

```bash
./scripts/backup-supabase.sh
```

Requires Supabase CLI logged in and project linked. Store the generated file off-repo (encrypted drive); do not commit dumps.

### Code

- Git tags before risky releases: `git tag pre-southampton-2026 && git push origin pre-southampton-2026`
- Vercel keeps **deployment history** — each production deploy is restorable (see Rollback).

## Rollback

### Frontend (Vercel)

1. Vercel → **Deployments** → find last known-good **Production** deploy → **⋯ → Promote to Production** (instant rollback of the Next.js app).
2. Or revert the git commit on `main` and push (triggers a new deploy).

### Edge functions

Redeploy from the tagged commit:

```bash
git checkout pre-southampton-2026
./scripts/deploy-edge-functions.sh
git checkout main
```

### Database

- Do **not** roll back schema casually during the show.
- For bad **data** changes: restore from Supabase backup or re-run a targeted SQL fix from your dump.
- Migrations are forward-only; keep a migration that fixes mistakes rather than deleting migration files.

## Cart & wishlist (cross-device)

Logged-in buyers sync cart/wishlist to `profiles.cart_data` and `profiles.wishlist_data`. Apply migration `20260912000005_buyer_cart_wishlist.sql` on each Supabase project. Guests still use browser `localStorage` only.

**Manual QA:** add item → refresh → item remains; log in on a second browser → lists merge from cloud.

## Pre-show checklist

- [ ] Staging project + preview URL tested (buyer checkout test mode, seller order, email receipt).
- [ ] DB backup / tag created.
- [ ] `GMAIL_USER=oceanhotspotservices@gmail.com` and app password set in **production** Supabase secrets.
- [ ] Stripe webhook points at **production** URL only; staging uses test webhook.
- [ ] Contact pages show single inbox: `oceanhotspotservices@gmail.com`.

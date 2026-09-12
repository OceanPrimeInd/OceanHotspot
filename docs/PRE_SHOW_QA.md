# Pre-show QA checklist

## Newsletter

1. Footer → enter test email → **Accept analytics** on cookie banner if prompted elsewhere.
2. Supabase → **Table Editor → `newsletter_subscribers`** — email appears, `is_active` true.
3. Inbox gets **welcome email**; **oceanhotspotservices@gmail.com** gets **“New newsletter subscriber”** (requires `GMAIL_USER` + `GMAIL_APP_PASSWORD` secrets and redeploy `send-welcome-email`).

```bash
supabase functions deploy send-welcome-email --no-verify-jwt
```

## Legal & policy pages

```bash
npm run dev
npm run test:legal
```

Manual read: payment wording = **Stripe at checkout**, **Stripe Connect** seller payouts, platform commission per Pricing.

## Analytics (first-party)

1. Apply migration `20260912000006_analytics_events.sql` in Supabase.
2. Browse site → click **Accept analytics** on cookie banner.
3. Search, open `/cart-checkout`, complete a test order.
4. **Admin → Analytics**: page views, **Top site searches**, **Checkout funnel**.

No Google Analytics — aligns with Cookie Policy.

## Cross-browser (desktop)

Same flows in **Chrome, Safari, Firefox, Edge**:

- Homepage + product page load
- Cookie banner → accept analytics
- Add to cart → checkout form (Stripe test)
- Footer newsletter signup
- `/discover` AI assistant

## Page speed (4G target &lt; 3s)

Chrome DevTools → **Network → Slow 4G** → test `/` and `/product/{id}`.

Improvements shipped: removed root `force-dynamic`, AVIF/WebP images config. If still slow, compress hero assets and lazy-load below-fold images.

## Deploy checklist

- [ ] SQL migrations applied (analytics + cart/wishlist if not done)
- [ ] `send-welcome-email` deployed
- [ ] `GMAIL_USER=oceanhotspotservices@gmail.com` in Supabase secrets
- [ ] `SITE_URL` = production URL

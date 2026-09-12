# Email not sending — fix checklist

Newsletter, order confirmations, and seller emails all use **`supabase/functions/_shared/email.ts`**.

## What was wrong (fixed in code)

1. **Your signup was saved** — only the confirmation email failed.
2. Supabase **did** have `GMAIL_USER` / `GMAIL_APP_PASSWORD`, but the old SMTP library crashed on Edge with: **`Deno.writeAll is not a function`**.
3. Email sending now uses **denomailer** (compatible with Supabase’s Deno runtime). After redeploy, tests return `{ "ok": true, "provider": "gmail_smtp" }`.

Redeploy all mail functions after pulling latest code:

```bash
./scripts/deploy-edge-functions.sh
```

## 1. Gmail (recommended for `oceanhotspotservices@gmail.com`)

1. Google Account → **Security** → turn on **2-Step Verification**.
2. **App passwords** → create one for “Mail” → copy the 16-character password.
3. Supabase Dashboard → **Project Settings → Edge Functions → Secrets**:

   | Secret | Value |
   |--------|--------|
   | `GMAIL_USER` | `oceanhotspotservices@gmail.com` |
   | `GMAIL_APP_PASSWORD` | 16 chars **with no spaces** (or paste with spaces — code strips them) |
   | `SITE_URL` | `https://www.oceanhotspot.com` (or your Vercel URL) |

4. Redeploy functions that send mail:

```bash
supabase functions deploy send-welcome-email --no-verify-jwt
supabase functions deploy confirm-payment
supabase functions deploy stripe-webhook --no-verify-jwt
```

## 2. Resend (you already have `RESEND_API_KEY`)

Code tries **Resend first** if the key is set. You must verify a **From** domain in [Resend](https://resend.com):

| Secret | Example |
|--------|---------|
| `EMAIL_FROM` | `Ocean Hotspot <hello@oceanhotspot.com>` (must be verified in Resend) |
| `RESEND_API_KEY` | `re_...` |

Until the domain is verified, Resend may fail — then Gmail SMTP is used.

## 3. Test

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/email-health" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"YOUR_EMAIL@gmail.com"}'
```

Check response: `{ "ok": true, "provider": "gmail_smtp" }` or `"resend"`.

View logs: Supabase Dashboard → **Edge Functions → send-welcome-email → Logs**.

## Emails land in Gmail Spam?

**Why:** Order mail is sent from **personal `@gmail.com` via Supabase servers**. Gmail often treats that as suspicious (automated HTML from a cloud IP, not the Gmail website).

**Quick help (same inbox):** Click **Report not spam** on one message — future Ocean Hotspot mail improves for that mailbox.

**Proper fix (before the show):** Send from your **domain** with DNS authentication:

1. [Resend](https://resend.com) → add domain **oceanhotspot.com** → add **SPF + DKIM** records to DNS (Resend shows exact values).
2. Supabase secrets:
   - `EMAIL_FROM` = `Ocean Hotspot <orders@oceanhotspot.com>` (or `noreply@…`)
   - `EMAIL_REPLY_TO` = `oceanhotspotservices@gmail.com`
   - Keep `RESEND_API_KEY`
3. Redeploy functions — code will **prefer Resend** when `EMAIL_FROM` is not a Gmail address.

**Code improvements deployed:** plain-text part, clearer From name, simpler subject line, company footer, Reply-To set.

## 4. Footer message

“You’re on the list, but we couldn’t send…” means **`subscribe_newsletter` succeeded** but **`send-welcome-email` failed**. Fix secrets above, redeploy, subscribe again (or use email-health test).

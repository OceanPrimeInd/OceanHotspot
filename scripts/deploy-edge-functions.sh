#!/usr/bin/env bash
# Deploy all Ocean Hotspot edge functions to Supabase
# Usage: ./scripts/deploy-edge-functions.sh
# Requires: supabase CLI logged in, project linked

set -euo pipefail

FUNCTIONS=(
  confirm-payment
  stripe-webhook
  create-connect-account
  check-connect-status
  create-stripe-login-link
  process-refund
  buyer-signup
  send-email
  order-status
  guest-order
  gdpr-request
  newsletter-unsubscribe
  ai-discovery
  create-checkout
  create-cart-checkout
  create-bank-order
  send-welcome-email
  email-health
  expansion-agent
)

echo "Deploying ${#FUNCTIONS[@]} edge functions..."

PUBLIC_FUNCTIONS=(stripe-webhook guest-order send-welcome-email newsletter-unsubscribe ai-discovery email-health)

for fn in "${FUNCTIONS[@]}"; do
  echo "→ $fn"
  if [[ " ${PUBLIC_FUNCTIONS[*]} " == *" $fn "* ]]; then
    supabase functions deploy "$fn" --no-verify-jwt
  else
    supabase functions deploy "$fn"
  fi
done

echo ""
echo "Done. Set these secrets in Supabase Dashboard → Edge Functions → Secrets:"
echo "  STRIPE_SECRET_KEY"
echo "  STRIPE_WEBHOOK_SECRET  (from Stripe webhook → checkout.session.completed + account.updated)"
echo "  GMAIL_USER             (oceanhotspotservices@gmail.com until Workspace is live)"
echo "  GMAIL_APP_PASSWORD"
echo "  SITE_URL               (optional, e.g. https://www.oceanhotspot.com — used in order emails)"
echo ""
echo "Stripe webhook URL:"
echo "  https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook"

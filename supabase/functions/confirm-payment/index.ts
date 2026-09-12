import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { markOrderPaidIfPending, sendPaidOrderEmailsIfNeeded } from "../_shared/orderPaid.ts";
import { ensureGuestAccessToken } from "../_shared/guestOrder.ts";

const ORDER_FIELDS =
  "id, order_number, buyer_email, buyer_name, total_amount, currency, status, payment_status, guest_access_token";

function jsonResponse(body: Record<string, unknown>, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req!), "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { session_id, order_id: orderIdFromClient } = await req.json();
    if (!session_id) {
      return jsonResponse({ error: "session_id required" }, 400, req);
    }

    const loadOrder = async (orderId: string) => {
      const { data } = await supabase
        .from("orders")
        .select(ORDER_FIELDS)
        .eq("id", orderId)
        .maybeSingle();
      return data;
    };

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return jsonResponse({ error: "STRIPE_SECRET_KEY not configured on server" }, 500, req);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let session: Stripe.Checkout.Session | null = null;
    let stripeError: string | null = null;

    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      stripeError = err instanceof Error ? err.message : "Stripe session error";
      console.error("confirm-payment stripe retrieve failed:", stripeError);
    }

    const orderId =
      session?.metadata?.order_id || orderIdFromClient || null;

    if (!orderId) {
      return jsonResponse({ error: "No order linked to this checkout session" }, 400, req);
    }

    // Already paid (webhook or previous confirm) — return order + retry email
    let existing = await loadOrder(orderId);
    if (existing?.payment_status === "paid") {
      const guestToken = await ensureGuestAccessToken(supabase, orderId);
      const emailSent = await sendPaidOrderEmailsIfNeeded(supabase, orderId);
      return jsonResponse({
        success: true,
        order: { ...existing, guest_access_token: guestToken ?? existing.guest_access_token },
        emailSent,
        source: "database",
        stripeWarning: stripeError,
      }, 200, req);
    }

    if (!session) {
      return jsonResponse({
        success: false,
        error: stripeError ||
          "Could not verify with Stripe. Use sk_test_ key for test checkout (cs_test_ sessions).",
        order: existing,
      }, 200, req);
    }

    if (orderIdFromClient && session.metadata?.order_id && session.metadata.order_id !== orderIdFromClient) {
      return jsonResponse({ error: "Order does not match checkout session" }, 400, req);
    }

    if (session.payment_status !== "paid") {
      return jsonResponse({
        success: false,
        status: session.payment_status,
        order: existing,
      }, 200, req);
    }

    try {
      const { order } = await markOrderPaidIfPending(
        supabase,
        orderId,
        (session.payment_intent as string) || null,
      );

      existing = order || (await loadOrder(orderId));
    } catch (markErr) {
      console.error("markOrderPaidIfPending failed:", markErr);
      existing = await loadOrder(orderId);
    }

    if (!existing) {
      return jsonResponse({ error: "Order not found" }, 404, req);
    }

    const guestToken = await ensureGuestAccessToken(supabase, orderId);
    const emailSent = await sendPaidOrderEmailsIfNeeded(supabase, orderId);

    return jsonResponse({
      success: existing.payment_status === "paid",
      order: { ...existing, guest_access_token: guestToken ?? existing.guest_access_token },
      emailSent,
    }, 200, req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("confirm-payment error:", message);
    return jsonResponse({ error: message }, 500, req);
  }
});

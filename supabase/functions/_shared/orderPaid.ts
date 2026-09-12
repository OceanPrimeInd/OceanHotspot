import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  orderConfirmationHtml,
  orderConfirmationPlainText,
  sellerNewOrderHtml,
  sendEmail,
} from "./email.ts";
import { ensureGuestAccessToken } from "./guestOrder.ts";

type SupabaseAdmin = ReturnType<typeof createClient>;

const ORDER_CORE_FIELDS =
  "id, order_number, buyer_email, buyer_name, total_amount, subtotal, vat_amount, shipping_cost, currency, seller_id, created_at, status, payment_status";

async function fetchOrderCore(supabase: SupabaseAdmin, orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_CORE_FIELDS)
    .eq("id", orderId)
    .maybeSingle();
  if (error) {
    console.error("fetchOrderCore error:", error.message);
    return null;
  }
  return data;
}

async function getConfirmationEmailSentAt(
  supabase: SupabaseAdmin,
  orderId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("buyer_confirmation_email_sent_at")
    .eq("id", orderId)
    .maybeSingle();
  if (error) {
    // Column may not exist until migration is applied
    return null;
  }
  return data?.buyer_confirmation_email_sent_at ?? null;
}

async function markConfirmationEmailSent(supabase: SupabaseAdmin, orderId: string) {
  const { error } = await supabase
    .from("orders")
    .update({ buyer_confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) {
    console.warn("Could not set buyer_confirmation_email_sent_at:", error.message);
  }
}

/** Send buyer + seller emails once per paid order (retries if first attempt missed). */
export async function sendPaidOrderEmailsIfNeeded(
  supabase: SupabaseAdmin,
  orderId: string,
): Promise<boolean> {
  try {
    const order = await fetchOrderCore(supabase, orderId);
    if (!order || order.payment_status !== "paid" || !order.buyer_email) {
      return false;
    }

    const alreadySent = await getConfirmationEmailSentAt(supabase, orderId);
    if (alreadySent) {
      return false;
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_title, quantity, unit_price, total_price")
      .eq("order_id", orderId);

    let sellerName: string | null = null;
    if (order.seller_id) {
      const { data: seller } = await supabase
        .from("profiles")
        .select("email, company_name, trading_name")
        .eq("id", order.seller_id)
        .maybeSingle();
      sellerName = seller?.trading_name || seller?.company_name || null;

      if (seller?.email) {
        await sendEmail({
          to: seller.email,
          subject: `New order — ${order.order_number}`,
          html: sellerNewOrderHtml({
            order_number: order.order_number,
            buyer_name: order.buyer_name,
            buyer_email: order.buyer_email,
            total_amount: order.total_amount,
            currency: order.currency,
          }),
        });
      }
    }

    const guestToken = await ensureGuestAccessToken(supabase, orderId);

    const lineItems = (items || []).map((i) => ({
      product_title: i.product_title,
      quantity: i.quantity,
      total_price: i.total_price,
    }));

    const buyerSent = await sendEmail({
      to: order.buyer_email,
      subject: `Your order ${order.order_number} is confirmed`,
      html: orderConfirmationHtml(order, lineItems, sellerName, guestToken),
      text: orderConfirmationPlainText(order, lineItems, sellerName, guestToken),
      replyTo: Deno.env.get("GMAIL_USER")?.trim() || undefined,
    });

    if (buyerSent) {
      await markConfirmationEmailSent(supabase, orderId);
      return true;
    }

    console.warn("Buyer confirmation email not sent — check GMAIL_USER / GMAIL_APP_PASSWORD");
    return false;
  } catch (err) {
    console.error("sendPaidOrderEmailsIfNeeded error:", err);
    return false;
  }
}

/** Mark order paid once; always attempt confirmation email after paid. */
export async function markOrderPaidIfPending(
  supabase: SupabaseAdmin,
  orderId: string,
  paymentIntentId: string | null,
) {
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      payment_intent_id: paymentIntentId,
    })
    .eq("id", orderId)
    .neq("payment_status", "paid")
    .select(ORDER_CORE_FIELDS)
    .maybeSingle();

  if (error) {
    console.error("markOrderPaidIfPending update error:", error.message);
    throw new Error(error.message);
  }

  const resolved = order || (await fetchOrderCore(supabase, orderId));

  if (resolved?.payment_status === "paid") {
    await sendPaidOrderEmailsIfNeeded(supabase, orderId);
  }

  return { order: resolved, newlyPaid: !!order };
}

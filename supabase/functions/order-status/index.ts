import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  deliveryNotificationHtml,
  dispatchNotificationHtml,
  sendEmail,
} from "../_shared/email.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { order_id, status, tracking_number } = await req.json();
    if (!order_id || !status) {
      return new Response(JSON.stringify({ error: "order_id and status required" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const allowed = ["processing", "shipped", "delivered"];
    if (!allowed.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { data: order, error: fetchError } = await supabaseUser
      .from("orders")
      .select("id, seller_id, order_number, buyer_email, buyer_name, status")
      .eq("id", order_id)
      .eq("seller_id", user.id)
      .single();

    if (fetchError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "shipped") {
      updateData.shipped_at = new Date().toISOString();
      if (tracking_number?.trim()) updateData.tracking_number = tracking_number.trim();
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", order_id)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message || "Update failed");
    }

    if (updated.buyer_email) {
      if (status === "shipped" && order.status !== "shipped") {
        await sendEmail({
          to: updated.buyer_email,
          subject: `Your order has shipped — ${updated.order_number}`,
          html: dispatchNotificationHtml(updated),
        });
      } else if (status === "delivered" && order.status !== "delivered") {
        await sendEmail({
          to: updated.buyer_email,
          subject: `Your order was delivered — ${updated.order_number}`,
          html: deliveryNotificationHtml(updated),
        });
      }
    }

    return new Response(JSON.stringify({ success: true, order: updated }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("order-status error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

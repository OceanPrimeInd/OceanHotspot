import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const { order_id, token, order_number, email } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let order = null;

    if (order_id && token) {
      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total_amount, subtotal, vat_amount, shipping_cost, currency, created_at, shipped_at, delivered_at, tracking_number, buyer_email, buyer_name, payment_status",
        )
        .eq("id", order_id)
        .eq("guest_access_token", token)
        .maybeSingle();
      order = data;
    } else if (order_number && email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total_amount, subtotal, vat_amount, shipping_cost, currency, created_at, shipped_at, delivered_at, tracking_number, buyer_email, buyer_name, payment_status, guest_access_token",
        )
        .eq("order_number", String(order_number).trim())
        .ilike("buyer_email", normalizedEmail)
        .maybeSingle();
      order = data;
    } else {
      return new Response(JSON.stringify({ error: "Provide order_id+token or order_number+email" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("id, product_id, product_title, product_image_url, quantity, unit_price, total_price, vat_rate")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    return new Response(
      JSON.stringify({
        order,
        items: items || [],
        guestToken: order.guest_access_token || null,
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

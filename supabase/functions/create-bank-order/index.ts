import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getCorsHeaders } from "../_shared/cors.ts";
import { bankOrderPlacedHtml, sendEmail } from "../_shared/email.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const {
      sellerId,
      buyerId,
      buyerEmail,
      buyerName,
      buyerPhone,
      shippingAddress,
      createAccount,
      subtotal,
      vatAmount,
      totalAmount,
      currency,
      paymentStatus,
      distributorId,
      distributorCommission,
      platformFee,
      sellerPayout,
      item,
      items,
    } = body;

    let validBuyerId = buyerId || null;
    if (createAccount && !validBuyerId && buyerEmail && buyerName) {
      const normalizedEmail = String(buyerEmail).trim().toLowerCase();
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        validBuyerId = existingProfile.id;
      } else {
        const generatedPassword = `OH-${crypto.randomUUID().slice(0, 12)}!`;
        const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password: generatedPassword,
          email_confirm: true,
          user_metadata: {
            full_name: buyerName,
            phone: buyerPhone || null,
          },
        });

        if (!createUserError && createdUser?.user) {
          validBuyerId = createdUser.user.id;
          await supabase.from("profiles").upsert({
            id: createdUser.user.id,
            email: normalizedEmail,
            full_name: buyerName,
            phone: buyerPhone || null,
            country: "United Kingdom",
            is_seller: false,
          }, { onConflict: "id" });
        } else {
          console.warn("Silent buyer account creation failed:", createUserError?.message || createUserError);
        }
      }
    }

    if (!sellerId || !buyerEmail || !buyerName || (!item && (!items || !Array.isArray(items) || items.length === 0))) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const formattedAddress = shippingAddress
      ? (typeof shippingAddress === "string" ? { address: shippingAddress } : shippingAddress)
      : null;

    const orderItems = Array.isArray(items) && items.length > 0 ? items : [item];

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        seller_id: sellerId,
        buyer_id: validBuyerId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        buyer_phone: buyerPhone || null,
        shipping_address: formattedAddress,
        subtotal: subtotal ?? 0,
        vat_amount: vatAmount ?? 0,
        total_amount: totalAmount ?? 0,
        currency: currency || "GBP",
        status: "pending_payment",
        payment_status: paymentStatus || "awaiting_bank_transfer",
        distributor_id: distributorId || null,
        distributor_commission: distributorCommission ?? 0,
        platform_fee: platformFee ?? 0,
        seller_payout: sellerPayout ?? 0,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("create-bank-order order error:", orderError);
      return new Response(JSON.stringify({ error: orderError?.message || "Order creation failed" }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const mappedItems = orderItems.map((entry: any) => ({
      order_id: order.id,
      product_id: entry.productId,
      product_title: entry.productTitle,
      product_image_url: entry.productImageUrl,
      unit_price: entry.unitPrice,
      quantity: entry.quantity ?? 1,
      total_price: entry.totalPrice ?? (entry.unitPrice * (entry.quantity ?? 1)),
      vat_rate: entry.vatRate ?? 0,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(mappedItems);

    if (itemsError) {
      console.error("create-bank-order items error:", itemsError);
      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    if (buyerEmail) {
      await sendEmail({
        to: buyerEmail,
        subject: `Order received — ${order.order_number}`,
        html: bankOrderPlacedHtml({
          order_number: order.order_number,
          buyer_name: buyerName,
          total_amount: totalAmount ?? 0,
          currency: currency || "GBP",
        }),
      });
    }

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("create-bank-order catch:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from "../_shared/cors.ts";
import { isShopCheckoutOpen, shopClosedResponse } from "../_shared/shopOpen.ts";
import { platformFeeFromOrderTotal } from "../_shared/platformCommission.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    if (!isShopCheckoutOpen()) {
      return shopClosedResponse(req, getCorsHeaders(req));
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { productId, buyerId, buyerEmail, buyerName, buyerPhone, shippingAddress, createAccount, successUrl, cancelUrl, distributorId } = await req.json();

    let validBuyerId: string | null = buyerId || null;
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

    if (!productId || !buyerEmail || !buyerName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate seller exists in auth.users (via profiles table)
    const { data: sellerProfile, error: sellerCheckError } = await supabase
      .from("profiles")
      .select("id, stripe_account_id, stripe_charges_enabled")
      .eq("id", product.seller_id)
      .maybeSingle();

    if (sellerCheckError || !sellerProfile) {
      console.error("Seller not found:", product.seller_id, sellerCheckError);
      return new Response(JSON.stringify({ error: "Seller account not found. This product may no longer be available." }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Validate buyer exists if buyerId is provided
    if (validBuyerId) {
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", validBuyerId)
        .maybeSingle();

      if (!buyerProfile) {
        console.warn("Buyer not found in profiles, setting buyer_id to null:", validBuyerId);
        validBuyerId = null;
      }
    }

    // ── Distributor commission split ────────────────────────────────────────
    // If a distributorId is passed (buyer came via a distributor showroom),
    // look up that distributor's commission rate and calculate the 3-way split:
    //   distributor_commission = order total × distributor rate
    //   platform_fee           = order total × 5%
    //   seller_payout          = remainder
    let validDistributorId: string | null = null;
    let distributorCommission = 0;
    let platformFee = 0;
    let sellerPayout = 0;

    const orderTotal = product.vat_treatment === "plus_vat"
      ? product.price * 1.2
      : product.price;

    if (distributorId) {
      const { data: dist } = await supabase
        .from("distributors")
        .select("id, commission_rate, status")
        .eq("id", distributorId)
        .eq("status", "approved")
        .maybeSingle();

      if (dist) {
        validDistributorId = dist.id;
        const rate = (dist.commission_rate || 10) / 100;
        distributorCommission = Math.round(orderTotal * rate * 100) / 100;
        platformFee = platformFeeFromOrderTotal(orderTotal);
        sellerPayout = Math.round((orderTotal - distributorCommission - platformFee) * 100) / 100;
      }
    }

    if (!validDistributorId) {
      // No distributor — platform takes 5%, seller gets the rest
      platformFee = platformFeeFromOrderTotal(orderTotal);
      sellerPayout = Math.round((orderTotal - platformFee) * 100) / 100;
    }
    // ────────────────────────────────────────────────────────────────────────

    // Create order in database first
    const formattedAddress = shippingAddress
      ? (typeof shippingAddress === "string" ? { address: shippingAddress } : shippingAddress)
      : null;

    console.log("Creating order with:", {
      seller_id: product.seller_id,
      buyer_id: buyerId || null,
      buyer_email: buyerEmail,
      distributor_id: validDistributorId,
      distributor_commission: distributorCommission,
      platform_fee: platformFee,
      seller_payout: sellerPayout,
    });

    const guestAccessToken = crypto.randomUUID();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        seller_id: product.seller_id,
        buyer_id: validBuyerId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        buyer_phone: buyerPhone || null,
        shipping_address: formattedAddress,
        subtotal: product.price,
        shipping_cost: 0,
        vat_amount: product.vat_treatment === "plus_vat" ? product.price * 0.2 : 0,
        total_amount: orderTotal,
        currency: product.currency || "GBP",
        status: "pending_payment",
        payment_status: "pending",
        distributor_id: validDistributorId,
        distributor_commission: distributorCommission,
        platform_fee: platformFee,
        seller_payout: sellerPayout,
        is_high_value: orderTotal > 5000,
        guest_access_token: guestAccessToken,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", JSON.stringify(orderError));
      return new Response(JSON.stringify({ error: `Order creation failed: ${orderError?.message} (code: ${orderError?.code}, details: ${orderError?.details})` }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Create order item
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: productId,
      product_title: product.title,
      product_image_url: product.image_url,
      unit_price: product.price,
      quantity: 1,
      total_price: product.price,
      vat_rate: product.vat_treatment === "plus_vat" ? 0.2 : 0,
    });

    const paymentIntentData: Record<string, unknown> = {
      capture_method: "automatic",
      metadata: { order_id: order.id },
    };

    if (sellerProfile?.stripe_account_id && sellerProfile?.stripe_charges_enabled) {
      paymentIntentData.transfer_data = { destination: sellerProfile.stripe_account_id };
      if (platformFee > 0) {
        paymentIntentData.application_fee_amount = Math.round(platformFee * 100);
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: (product.currency || "GBP").toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
            unit_amount: Math.round(order.total_amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
        product_id: productId,
        seller_id: product.seller_id,
      },
      success_url: `${successUrl}?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}&token=${guestAccessToken}`,
      cancel_url: cancelUrl,
      payment_intent_data: paymentIntentData,
    });

    // Update order with payment intent
    await supabase
      .from("orders")
      .update({ payment_intent_id: session.payment_intent as string })
      .eq("id", order.id);

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order.id
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

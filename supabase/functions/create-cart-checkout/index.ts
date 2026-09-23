// 1. URL-based imports for Deno (No 'npm install' or package.json needed)
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno&no-check";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

import { getCorsHeaders } from "../_shared/cors.ts";
import { isShopCheckoutOpen, shopClosedResponse } from "../_shared/shopOpen.ts";

interface CartItem {
  productId: string;
  quantity: number;
}

// 3. The main entry point using the modern Deno.serve syntax
Deno.serve(async (req) => {
  // 4. Handle CORS Preflight (Fixes ERR_FAILED)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    if (!isShopCheckoutOpen()) {
      return shopClosedResponse(req, getCorsHeaders(req));
    }

    // 5. Initialize Stripe with the Secret Key from your Supabase Secrets
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // 6. Initialize Supabase Client using internal service role keys
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 7. Extract data from the frontend request
    const { cartItems, buyerId, buyerEmail, buyerName, buyerPhone, shippingAddress, createAccount, successUrl, cancelUrl } = await req.json();

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

    // 8. Fetch product details from your 'products' table to verify prices
    const productIds = cartItems.map((item: CartItem) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      console.error("Product fetch error:", productsError);
      throw new Error("Failed to fetch products: " + productsError.message);
    }

    if (!products || products.length === 0) {
      throw new Error("No products found for the given IDs: " + productIds.join(", "));
    }

    const productMap = new Map(products.map(p => [p.id, p]));
    const firstSellerId = products[0].seller_id;

    // 8b. Validate seller exists in auth.users (via profiles table)
    const { data: sellerProfile, error: sellerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", firstSellerId)
      .maybeSingle();

    if (sellerError || !sellerProfile) {
      console.error("Seller not found:", firstSellerId, sellerError);
      return new Response(JSON.stringify({ error: "Seller account not found. This product may no longer be available." }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // 8c. Validate buyer exists if buyerId is provided
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

    // 9. Prepare the Line Items for Stripe
    let subtotal = 0;
    let vatAmount = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cartItems as CartItem[]) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      const itemPrice = product.price * item.quantity;
      const itemVat = product.vat_treatment === "plus_vat" ? itemPrice * 0.2 : 0;
      
      subtotal += itemPrice;
      vatAmount += itemVat;

      lineItems.push({
        price_data: {
          currency: (product.currency || "GBP").toLowerCase(),
          product_data: {
            name: product.title,
            images: product.image_url ? [product.image_url] : undefined,
          },
          // Stripe expects integers in cents/pence
          unit_amount: Math.round((product.price + (product.vat_treatment === "plus_vat" ? product.price * 0.2 : 0)) * 100),
        },
        quantity: item.quantity,
      });
    }

    // 10. Record the order in your database
    // Format shipping_address as JSONB (DB expects JSONB, not plain text)
    const formattedAddress = shippingAddress
      ? (typeof shippingAddress === "string" ? { address: shippingAddress } : shippingAddress)
      : null;

    console.log("Creating order with:", {
      seller_id: firstSellerId,
      buyer_id: buyerId || null,
      buyer_email: buyerEmail,
      item_count: lineItems.length,
    });

    const guestAccessToken = crypto.randomUUID();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        seller_id: firstSellerId,
        buyer_id: validBuyerId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        buyer_phone: buyerPhone || null,
        shipping_address: formattedAddress,
        subtotal: subtotal,
        vat_amount: vatAmount,
        total_amount: subtotal + vatAmount,
        currency: products[0]?.currency || "GBP",
        status: "pending_payment",
        payment_status: "pending",
        guest_access_token: guestAccessToken,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation failed:", JSON.stringify(orderError));
      throw new Error(`Order creation failed: ${orderError.message} (code: ${orderError.code}, details: ${orderError.details})`);
    }

    // 10b. Create order items for each cart item
    const orderItems = [];
    for (const item of cartItems as CartItem[]) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      orderItems.push({
        order_id: order.id,
        product_id: product.id,
        product_title: product.title,
        product_image_url: product.image_url,
        unit_price: product.price,
        quantity: item.quantity,
        total_price: product.price * item.quantity,
        vat_rate: product.vat_treatment === "plus_vat" ? 0.2 : 0,
      });
    }

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw new Error("Failed to create order items");
      }
    }

    // 11. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: buyerEmail,
      line_items: lineItems,
      metadata: { order_id: order.id },
      success_url: `${successUrl}?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}&token=${guestAccessToken}`,
      cancel_url: cancelUrl,
    });

    // 12. Return the URL back to your CartCheckout.tsx
    return new Response(JSON.stringify({ 
      url: session.url, 
      orderId: order.id 
    }), {
      status: 200,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, // This triggers the 'non-2xx status code' in your frontend
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

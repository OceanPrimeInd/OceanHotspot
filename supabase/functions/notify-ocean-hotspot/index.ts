import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendEmailDetailed } from "../_shared/email.ts";
import { CONTACT_EMAIL } from "../_shared/contact.ts";
import { isShopCheckoutOpen } from "../_shared/shopOpen.ts";

function openingAlertEmail(): string {
  return Deno.env.get("OPENING_ALERT_EMAIL")?.trim() || CONTACT_EMAIL;
}

type WishlistPayload = {
  type: "wishlist_request";
  /** Set when the row was already inserted client-side; otherwise the function persists with service role. */
  requestId?: string;
  customerName: string;
  email: string;
  mobile?: string;
  deliveryPostcode?: string;
  boatDescription?: string;
  boatLocation?: string;
  contactPreference: string;
  extraNotes?: string;
  consentOpeningAnnounce?: boolean;
  items: Array<{
    title: string;
    part_number?: string | null;
    supplier_name?: string | null;
    price?: number;
    currency?: string;
    quantity?: number;
    note?: string | null;
  }>;
};

type SupplierPayload = {
  type: "supplier_application";
  applicationId: string;
  companyName: string;
  email: string;
  contactName: string;
  loadRoute: string;
  phone?: string;
  supplierType?: string;
  boatTypes?: string[];
  categories?: string[];
};

function formatItemsHtml(items: WishlistPayload["items"]): string {
  return items
    .map((item, i) => {
      const qty = item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : "";
      const lines = [
        `<strong>${i + 1}. ${item.title}${qty}</strong>`,
        item.part_number ? `Part: ${item.part_number}` : "",
        item.supplier_name ? `Supplier: ${item.supplier_name}` : "",
        item.price != null && item.currency ? `Price: ${item.currency} ${item.price} ex VAT` : "",
        item.note ? `Note: ${item.note}` : "",
      ].filter(Boolean);
      return `<li>${lines.join("<br/>")}</li>`;
    })
    .join("");
}

async function rateLimitWishlistEmail(
  supabase: ReturnType<typeof createClient>,
  email: string,
): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("wishlist_requests")
    .select("id", { count: "exact", head: true })
    .eq("email", email.toLowerCase())
    .gte("created_at", since);
  if (error) return true;
  return (count ?? 0) < 5;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const alertTo = openingAlertEmail();
    const cors = getCorsHeaders(req);

    if (body.type === "supplier_application") {
      const b = body as SupplierPayload;
      if (!b.email || !b.companyName) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const html = `
        <h2>New supplier application</h2>
        <p><strong>${b.companyName}</strong></p>
        <p>Contact: ${b.contactName} — ${b.email}<br/>
        Phone: ${b.phone || "—"}<br/>
        Type: ${b.supplierType || "—"}<br/>
        Load route: ${b.loadRoute}<br/>
        Boat types: ${(b.boatTypes || []).join(", ") || "—"}<br/>
        Categories: ${(b.categories || []).join(", ") || "—"}</p>
        <p>Application ID: ${b.applicationId}</p>
      `;
      const send = await sendEmailDetailed({
        to: alertTo,
        subject: `Supplier application: ${b.companyName}`,
        html,
        replyTo: b.email,
      });
      return new Response(JSON.stringify({ ok: send.ok, emailAdmin: send }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const b = body as WishlistPayload;
    if (b.type !== "wishlist_request" || !b.email || !b.customerName) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const allowed = await rateLimitWishlistEmail(supabase, b.email);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Too many requests — try again later." }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let requestId = b.requestId?.trim() || "";
    if (!requestId) {
      const pref = (b.contactPreference || "email").toLowerCase();
      const contactVia =
        pref === "whatsapp" ? "WhatsApp" : pref === "both" ? "Both" : "Email";

      let userId: string | null = null;
      const authHeader = req.headers.get("Authorization");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
      if (authHeader && anonKey) {
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: userData } = await userClient.auth.getUser();
        userId = userData.user?.id ?? null;
      }

      const { data: row, error: insertError } = await supabase
        .from("wishlist_requests")
        .insert({
          user_id: userId,
          name: b.customerName.trim(),
          email: b.email.trim().toLowerCase(),
          phone: b.mobile?.trim() || null,
          delivery_postcode: b.deliveryPostcode?.trim() || null,
          boat: b.boatDescription?.trim() || null,
          harbour: b.boatLocation?.trim() || null,
          contact_via: contactVia,
          notes: b.extraNotes?.trim() || null,
          consent_contact: true,
          consent_opening: !!b.consentOpeningAnnounce,
          items: b.items || [],
        })
        .select("id")
        .single();

      if (insertError || !row?.id) {
        console.error("wishlist_requests insert", insertError);
        return new Response(
          JSON.stringify({ error: insertError?.message || "Could not save wish list" }),
          { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
        );
      }
      requestId = row.id;
    }

    const itemsHtml = formatItemsHtml(b.items || []);

    const adminHtml = `
      <h2>New wish list submission</h2>
      <p><strong>${b.customerName}</strong> — ${b.email}</p>
      <p>Mobile: ${b.mobile || "—"}<br/>
      Postcode: ${b.deliveryPostcode || "—"}<br/>
      Boat: ${b.boatDescription || "—"}<br/>
      Kept: ${b.boatLocation || "—"}<br/>
      Contact via: ${b.contactPreference}<br/>
      Opening announcement: ${b.consentOpeningAnnounce ? "Yes" : "No"}</p>
      ${b.extraNotes ? `<p>Notes: ${b.extraNotes}</p>` : ""}
      <ul>${itemsHtml}</ul>
      <p>Request ID: ${requestId}</p>
    `;

    const customerHtml = `
      <h2>Thank you — your wish list is with us</h2>
      <p>Hi ${b.customerName},</p>
      <p>We will confirm price, availability and delivery for each item, and tell you the day we open.</p>
      <p>Your list:</p>
      <ul>${itemsHtml}</ul>
      <p>Questions? Reply to this email or message us on WhatsApp.</p>
    `;

    const adminSend = await sendEmailDetailed({
      to: alertTo,
      subject: `Wish list from ${b.customerName}`,
      html: adminHtml,
      replyTo: b.email,
    });

    const customerSend = await sendEmailDetailed({
      to: b.email,
      subject: "Your Ocean Hotspot wish list",
      html: customerHtml,
    });

    if (!adminSend.ok || !customerSend.ok) {
      console.error("Email errors", adminSend, customerSend);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        requestId,
        shopOpen: isShopCheckoutOpen(),
        emailAdmin: adminSend,
        emailCustomer: customerSend,
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

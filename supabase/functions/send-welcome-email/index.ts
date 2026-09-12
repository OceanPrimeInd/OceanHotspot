import { getCorsHeaders } from "../_shared/cors.ts";
import { CONTACT_EMAIL } from "../_shared/contact.ts";
import { sendEmailDetailed } from "../_shared/email.ts";

function siteBrowseUrl() {
  const base = Deno.env.get("SITE_URL") || "https://www.oceanhotspot.com";
  return `${base.replace(/\/$/, "")}/browse`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const { email } = await req.json();

    if (!email || !String(email).includes("@")) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const normalized = String(email).trim().toLowerCase();
    const browseUrl = siteBrowseUrl();

    const subscriberHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0c4a6e;">Welcome aboard!</h2>
        <p>Thank you for subscribing to the Ocean Hotspot newsletter.</p>
        <p>You'll hear about new listings, seller updates, and marine sourcing tips.</p>
        <p style="margin-top: 24px;">
          <a href="${browseUrl}" style="display:inline-block;background:#FF6B14;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Browse the catalog</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280;">
          You're receiving this because you subscribed at oceanhotspot.com.
          Questions? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.
        </p>
      </div>`;

    const sent = await sendEmailDetailed({
      to: normalized,
      subject: "You're subscribed — Ocean Hotspot newsletter",
      html: subscriberHtml,
    });

    if (sent.ok) {
      await sendEmailDetailed({
        to: CONTACT_EMAIL,
        subject: `New newsletter subscriber: ${normalized}`,
        html: `<p>New newsletter signup: <strong>${normalized}</strong></p><p>Time: ${new Date().toISOString()}</p>`,
      });
    }

    if (!sent.ok) {
      console.error("Newsletter welcome not sent:", sent.reason);
      return new Response(
        JSON.stringify({
          error: "Could not send confirmation email. Server mail is misconfigured — check Supabase function logs.",
          detail: sent.reason,
        }),
        { status: 503, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Newsletter welcome email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

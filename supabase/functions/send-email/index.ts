import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { enquiryNotificationHtml, sendEmail } from "../_shared/email.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const body = await req.json();
    const { to, subject, html, text, type, data } = body;

    if (!to) {
      return new Response(JSON.stringify({ error: "to required" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    let emailSubject = subject;
    let emailHtml = html;

    if (type === "enquiry_notification" && data) {
      emailSubject = subject || `New enquiry — ${data.productTitle || "Ocean Hotspot"}`;
      emailHtml = enquiryNotificationHtml({
        productTitle: data.productTitle,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        message: data.message,
        dashboardUrl: data.dashboardUrl,
      });
    }

    if (!emailSubject) {
      return new Response(JSON.stringify({ error: "subject required" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const finalHtml = emailHtml || `<p>${text || ""}</p>`;
    const sent = await sendEmail({ to, subject: emailSubject, html: finalHtml });

    return new Response(JSON.stringify({ success: sent, type: type || "generic" }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

import { getCorsHeaders } from "../_shared/cors.ts";
import { sendEmailDetailed } from "../_shared/email.ts";

/** POST { "probe": true } — sends a test only if Authorization is service role (optional). GET returns config flags. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  const hasGmail = !!(Deno.env.get("GMAIL_USER")?.trim() && Deno.env.get("GMAIL_APP_PASSWORD"));
  const hasResend = !!Deno.env.get("RESEND_API_KEY")?.trim();
  const hasSmtp = !!(
    Deno.env.get("SMTP_HOST")?.trim() &&
    Deno.env.get("SMTP_USER")?.trim() &&
    Deno.env.get("SMTP_PASS")
  );

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        gmail: hasGmail,
        resend: hasResend,
        custom_smtp: hasSmtp,
        email_from: !!Deno.env.get("EMAIL_FROM")?.trim(),
        site_url: !!Deno.env.get("SITE_URL")?.trim(),
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const to = body?.to as string | undefined;
  if (!to || !to.includes("@")) {
    return new Response(JSON.stringify({ error: "POST body needs { to: email }" }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  const result = await sendEmailDetailed({
    to: to.trim(),
    subject: "Ocean Hotspot email test",
    html: "<p>If you received this, edge function email is working.</p>",
  });

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 503,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
});

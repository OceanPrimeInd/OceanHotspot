import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      throw new Error("Email credentials not configured");
    }

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: gmailUser,
      password: gmailPassword,
    });

    await client.send({
      from: `Ocean Hotspot <${gmailUser}>`,
      to: email,
      subject: "Welcome to the Ocean Hotspot Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0c4a6e;">Welcome aboard!</h2>
          <p>Thank you for subscribing to the Ocean Hotspot newsletter.</p>
          <p>You'll be the first to hear about:</p>
          <ul>
            <li>Exclusive deals and offers</li>
            <li>New product arrivals</li>
            <li>Maritime industry insights</li>
          </ul>
          <p style="margin-top: 24px;">
            In the meantime, browse our latest listings at
            <a href="https://ocean-hotspot-next.vercel.app/browse" style="color: #0c4a6e;">Ocean Hotspot</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6b7280;">
            You're receiving this because you subscribed at oceanhotspot.com.<br/>
            To unsubscribe, reply to this email.
          </p>
        </div>
      `,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Email send error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

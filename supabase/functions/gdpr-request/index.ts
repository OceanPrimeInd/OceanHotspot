import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { gdprRequestNotificationHtml, sendEmail } from "../_shared/email.ts";
import { CONTACT_EMAIL } from "../_shared/contact.ts";
const VALID_TYPES = ["erasure", "access", "portability"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const { request_type, email, full_name, message } = await req.json();

    if (!request_type || !email || !VALID_TYPES.includes(request_type)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id ?? null;
    }

    const { error } = await supabase.from("gdpr_requests").insert({
      request_type,
      email: String(email).trim().toLowerCase(),
      full_name: full_name?.trim() || null,
      message: message?.trim() || null,
      user_id: userId,
    });

    if (error) throw new Error(error.message);

    await sendEmail({
      to: CONTACT_EMAIL,
      subject: `GDPR ${request_type} request — ${email}`,
      html: gdprRequestNotificationHtml({
        request_type,
        email,
        full_name,
        message,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
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

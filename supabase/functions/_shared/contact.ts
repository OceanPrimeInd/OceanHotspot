/** Public support inbox — override with Supabase secret CONTACT_EMAIL if needed */
export const CONTACT_EMAIL =
  Deno.env.get("CONTACT_EMAIL") ?? "oceanhotspotservices@gmail.com";

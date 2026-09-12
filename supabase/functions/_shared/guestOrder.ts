import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SupabaseAdmin = ReturnType<typeof createClient>;

export function newGuestAccessToken(): string {
  return crypto.randomUUID();
}

export async function ensureGuestAccessToken(
  supabase: SupabaseAdmin,
  orderId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("orders")
    .select("guest_access_token")
    .eq("id", orderId)
    .maybeSingle();

  if (existing?.guest_access_token) {
    return existing.guest_access_token;
  }

  const token = newGuestAccessToken();
  const { data: updated, error } = await supabase
    .from("orders")
    .update({ guest_access_token: token })
    .eq("id", orderId)
    .select("guest_access_token")
    .maybeSingle();

  if (error) {
    console.warn("guest_access_token not set (run migration?):", error.message);
    return null;
  }

  return updated?.guest_access_token ?? token;
}

import type { SupabaseClient } from "@supabase/supabase-js";

/** products.seller_id → auth.users; company name lives on profiles (same id). */
export async function attachSellerCompanies<T extends { seller_id?: string | null }>(
  supabase: SupabaseClient,
  rows: T[],
): Promise<(T & { seller_company: string | null })[]> {
  if (!rows.length) return rows.map((r) => ({ ...r, seller_company: null }));

  const sellerIds = [...new Set(rows.map((r) => r.seller_id).filter(Boolean))] as string[];
  if (!sellerIds.length) {
    return rows.map((r) => ({ ...r, seller_company: null }));
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, company_name, trading_name")
    .in("id", sellerIds);

  const nameById = new Map(
    (profiles || []).map((p) => [
      p.id,
      (p.company_name || p.trading_name || null) as string | null,
    ]),
  );

  return rows.map((row) => ({
    ...row,
    seller_company: row.seller_id ? nameById.get(row.seller_id) ?? null : null,
  }));
}

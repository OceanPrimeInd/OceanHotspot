import { supabase } from "@/lib/supabase/client";

export type ProfileListColumn = "cart_data" | "wishlist_data";

export async function loadProfileList<T>(
  userId: string,
  column: ProfileListColumn,
): Promise<T[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(column)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn(`loadProfileList ${column}:`, error.message);
    return [];
  }

  const raw = data?.[column];
  return Array.isArray(raw) ? (raw as T[]) : [];
}

export async function saveProfileList<T>(
  userId: string,
  column: ProfileListColumn,
  items: T[],
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ [column]: items, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.warn(`saveProfileList ${column}:`, error.message);
    return false;
  }
  return true;
}

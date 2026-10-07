/** Shoppers should not see another supplier’s brand on Ocean Hotspot. */
export function isHiddenSupplierBrand(name?: string | null, logoUrl?: string | null): boolean {
  return /jpc\s*direct|jpcdirect\.com/i.test(`${name ?? ""} ${logoUrl ?? ""}`);
}

export function shopperBrandName(name?: string | null, logoUrl?: string | null): string {
  if (isHiddenSupplierBrand(name, logoUrl)) return "Ocean Hotspot";
  return name?.trim() || "Ocean Hotspot";
}

export function shopperLogoUrl(name?: string | null, logoUrl?: string | null): string | null {
  if (isHiddenSupplierBrand(name, logoUrl)) return "/logo.png";
  return logoUrl || null;
}

export function shopperCopy(text: string | null | undefined, name?: string | null, logoUrl?: string | null): string {
  if (!text) return "";
  if (!isHiddenSupplierBrand(name, logoUrl)) return text;
  return text.replace(/jpc\s*direct/gi, "Ocean Hotspot");
}

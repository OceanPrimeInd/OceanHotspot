/** Hide supplier advertising that arrived with scraped catalogue text. */
export function cleanListingCopy(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/jpc\s*direct/gi, "")
    .replace(/waiting\s+image/gi, "")
    .replace(/\b\d+\s+suppliers?\b/gi, "Ocean Hotspot")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .trim();
}

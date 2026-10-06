function decodeListingEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/** Hide supplier advertising that arrived with scraped catalogue text. */
export function cleanListingCopy(value: string | null | undefined): string {
  if (!value) return "";
  let text = value;
  for (let pass = 0; pass < 2; pass += 1) {
    const decoded = decodeListingEntities(text);
    if (decoded === text) break;
    text = decoded;
  }
  return text
    .replace(/jpc\s*direct/gi, "")
    .replace(/waiting\s+image/gi, "")
    .replace(/\b\d+\s+suppliers?\b/gi, "Ocean Hotspot")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .trim();
}

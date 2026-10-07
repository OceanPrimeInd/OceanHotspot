export const PRODUCT_IMAGE_UNAVAILABLE = "Awaiting Image";

/** Supplier placeholder art, including the JPC Direct “awaiting image” logo. */
export function isMissingProductImage(url?: string | null): boolean {
  if (!url?.trim()) return true;
  const value = url.toLowerCase();
  return (
    value.includes("awaiting-image") ||
    value.includes("awaiting_image") ||
    value.includes("awaiting image") ||
    (value.includes("jpcdirect.com") && value.includes("logo"))
  );
}

export function realProductImages(urls: Array<string | null | undefined>): string[] {
  return [...new Set(urls.filter((url): url is string => Boolean(url && !isMissingProductImage(url))))];
}

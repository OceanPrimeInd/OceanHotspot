import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

export function formatPrice(currency: string | null | undefined, amount: number): string {
  const code = (currency || "GBP").trim().toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];
  const prefix = symbol ? `${symbol} ` : `${code} `;
  return `${prefix}${amount.toLocaleString()}`;
}

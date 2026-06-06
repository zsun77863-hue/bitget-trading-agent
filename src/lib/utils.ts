import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, digits = 2): string {
  if (!isFinite(num)) return "-";
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(digits) + "M";
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(digits) + "K";
  return num.toFixed(digits);
}

export function formatPct(n: number, digits = 2): string {
  return (n * 100).toFixed(digits) + "%";
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

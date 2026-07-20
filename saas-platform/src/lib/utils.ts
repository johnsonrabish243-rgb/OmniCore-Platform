import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string relative to now
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "il y a quelques secondes";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return then.toLocaleDateString("fr-FR");
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Generate an avatar URL from a name
 */
export function getAvatarUrl(name: string, size: number = 40): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=2563EB&color=fff&size=${size}&bold=true`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Generate a random color from the brand palette
 */
export function getBrandColor(index: number): string {
  const colors = [
    "#2563EB", "#3B82F6", "#60A5FA",
    "#10B981", "#34D399",
    "#F59E0B", "#FBBF24",
    "#EF4444", "#F87171",
    "#8B5CF6", "#A78BFA",
  ];
  return colors[index % colors.length];
}

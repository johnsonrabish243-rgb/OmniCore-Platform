import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate an avatar URL from a name
 */
export function getAvatarUrl(name: string, size: number = 40): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=2563EB&color=fff&size=${size}&bold=true`;
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

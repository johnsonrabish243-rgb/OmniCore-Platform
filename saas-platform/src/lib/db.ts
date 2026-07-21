import { createAdminClient } from "@insforge/sdk";

/**
 * Database utility using InsForge for all queries.
 *
 * For authenticated API routes, use the createClient from @/lib/supabase/server
 * which properly handles auth sessions via cookies.
 */

/**
 * Get an InsForge admin client with the API key for admin operations.
 * Bypasses RLS — use with extreme care in admin-only API routes.
 * Supabase service_role key equivalent.
 */
export async function getAdminDb() {
  return createAdminClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    apiKey: process.env.INSFORGE_API_KEY!,
  });
}

/**
 * Helper to transform Supabase snake_case columns to camelCase object keys.
 */
export function toCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

/**
 * Transform an object from camelCase to snake_case for inserts/updates.
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

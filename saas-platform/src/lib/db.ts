import { createClient } from "@supabase/supabase-js";

/**
 * Database utility using Supabase for all queries.
 * This replaces Prisma as the database ORM.
 *
 * For authenticated API routes, use the createClient from @/lib/supabase/server
 * which properly handles auth sessions via cookies.
 */

/**
 * Get a Supabase client with the service role key for admin operations.
 * Bypasses RLS — use with extreme care in admin-only API routes.
 */
export async function getAdminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
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
 * Transform an object from camelCase to snake_case for Supabase inserts/updates.
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

/**
 * Database utility using InsForge for all queries.
 *
 * For authenticated API routes, use createClient from @/lib/supabase/server
 * which properly handles auth sessions via cookies.
 *
 * For admin operations needing RLS bypass, use:
 *   import { createAdminClient } from "@insforge/sdk";
 *   const admin = createAdminClient({ baseUrl, apiKey });
 *   await admin.database.from("table").select("*");
 */

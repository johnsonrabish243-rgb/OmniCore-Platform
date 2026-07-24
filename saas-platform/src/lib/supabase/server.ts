import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { wrapAuth } from "@/lib/create-insforge-client";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || "";

/**
 * Create an InsForge client for server-side API routes.
 * Uses @insforge/sdk/ssr for proper cookie-based session management.
 * Returns a Supabase-compatible interface with auth method mapping.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: any) {
        cookieStore.set(name, value, options);
      },
      delete(name: string) {
        cookieStore.delete(name);
      },
    } as any,
  });

  // Replace auth with the proxied version (typed as any for TS compatibility)
  Object.defineProperty(client, "auth", {
    value: wrapAuth(client.auth, INSFORGE_URL, INSFORGE_API_KEY),
    writable: false,
    configurable: false,
  });

  // Add Supabase-compatible .from() and .rpc() at top level
  return Object.assign(client, {
    from: (table: string) => client.database.from(table),
    rpc: (fn: string, params?: any) => client.database.rpc(fn, params),
  }) as any;
}

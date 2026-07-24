/**
 * Creates an InsForge client with a full Supabase-compatible interface.
 *
 * Handles:
 * - `.from()` → `.database.from()` (table queries)
 * - `.rpc()` → `.database.rpc()` (function calls)
 * - `.auth.getUser()` → `.auth.getCurrentUser()` (method name mapping)
 * - `.auth.admin.*` → admin operations via `createAdminClient`
 */

import { createClient as createInsforgeClient, createAdminClient } from "@insforge/sdk";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || "";

/**
 * Wraps an InsForge auth object with a Proxy that maps Supabase method names to InsForge equivalents.
 * Shared function - import this from server.ts and middleware.ts instead of duplicating.
 */
export function wrapAuth(auth: any, baseUrl: string, apiKey: string): any {
  return new Proxy(auth, {
    get(target: any, prop: string | symbol) {
      // Map Supabase method names to InsForge method names
      const methodMap: Record<string, string> = {
        getUser: "getCurrentUser",
        resetPasswordForEmail: "sendResetPasswordEmail",
      };
      const mappedProp = methodMap[prop as string] || prop;

      // Handle admin operations via createAdminClient (bypasses RLS)
      if (prop === "admin") {
        return new Proxy(
          {},
          {
            get(_adminTarget: any, adminProp: string | symbol) {
              if (adminProp === "deleteUser") {
                return async (userId: string) => {
                  const admin = createAdminClient({ baseUrl, apiKey });
                  return (admin.auth as any).admin?.deleteUser(userId);
                };
              }
              return undefined;
            },
          }
        );
      }

      // Handle exchangeCodeForSession → InsForge uses exchangeOAuthCode
      if (prop === "exchangeCodeForSession") {
        return async (code: string) => {
          if (typeof (target as any).exchangeOAuthCode === "function") {
            return await (target as any).exchangeOAuthCode(code);
          }
          if (typeof (target as any).exchangeCodeForSession === "function") {
            return await (target as any).exchangeCodeForSession(code);
          }
          console.warn("exchangeCodeForSession/exchangeOAuthCode not available in InsForge SDK.");
          return { data: { user: null, session: null }, error: null };
        };
      }

      // Handle updateUser → maps to updatePassword / updateEmail
      if (prop === "updateUser") {
        return async (updates: any) => {
          if (updates.password) {
            return (target as any).updatePassword?.(updates.password) || {
              data: null,
              error: new Error("updatePassword not available"),
            };
          }
          if (updates.email) {
            return (target as any).updateEmail?.(updates.email) || {
              data: null,
              error: new Error("updateEmail not available"),
            };
          }
          return { data: null, error: new Error("Unsupported updateUser operation") };
        };
      }

      const value = (target as any)[mappedProp];
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });
}

export function createClient() {
  const client = createInsforgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
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

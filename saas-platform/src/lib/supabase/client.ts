"use client";

import { createBrowserClient } from "@insforge/sdk/ssr";

export function createClient() {
  const insforge = createBrowserClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
  });

  // Add Supabase-compatible .from() and .rpc() at top level
  return Object.assign(insforge, {
    from: (table: string) => insforge.database.from(table),
    rpc: (fn: string, params?: any) => insforge.database.rpc(fn, params),
  }) as any;
}

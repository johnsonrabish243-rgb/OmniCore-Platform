import { updateSession as insforgeUpdateSession } from "@insforge/sdk/ssr/middleware";
import { createServerClient } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { wrapAuth } from "@/lib/create-insforge-client";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || "";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Create CookieStore adapter for request cookies (InsForge-compatible)
  const requestCookies: any = {
    get(name: string) {
      const cookie = request.cookies.get(name);
      if (!cookie) return undefined;
      return { value: cookie.value };
    },
  };

  // Create CookieStore adapter for response cookies
  const responseCookies: any = {
    set(name: string, value: string, options?: any) {
      response.cookies.set(name, value, options);
    },
    delete(name: string) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    },
  };

  // Refresh the session via InsForge middleware
  await insforgeUpdateSession({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
    requestCookies,
    responseCookies,
  });

  // Create a server client to get the authenticated user
  const supabase = createServerClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
    },
  });

  // Apply wrapAuth BEFORE calling auth methods to map getUser → getCurrentUser
  const wrappedAuth = wrapAuth(supabase.auth, INSFORGE_URL, INSFORGE_API_KEY);

  const {
    data: { user },
  } = await wrappedAuth.getUser();

  // Return Supabase-compatible interface
  return {
    supabaseResponse: response,
    user,
    supabase: Object.assign(supabase, {
      auth: wrappedAuth,
      from: (table: string) => supabase.database.from(table),
      rpc: (fn: string, params?: any) => supabase.database.rpc(fn, params),
    }),
  } as any;
}

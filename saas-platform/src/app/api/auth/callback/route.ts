import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth callback route.
 * Called after a user completes OAuth (Google, GitHub) or email link sign-in.
 * The @supabase/ssr client will persist the session in cookies automatically.
 */
export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error");
        return NextResponse.redirect(new URL("/fr/login?error=auth_callback_error", request.url));
      }

      if (data.user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email || "",
            first_name: data.user.user_metadata?.full_name?.split(" ")[0] || data.user.user_metadata?.name || "",
            last_name: data.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
            avatar_url: data.user.user_metadata?.avatar_url || "",
            role: "EMPLOYEE",
            language: "fr",
            timezone: "Europe/Paris",
          });

          if (insertError) {
            console.error("Failed to create user profile from OAuth");
          }
        }
      }
    }

    const locale = requestUrl.pathname.split("/")[1] || "fr";
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  } catch (error) {
    console.error("Auth callback failed");
    return NextResponse.redirect(new URL("/fr/login?error=auth_callback_error", request.url));
  }
}

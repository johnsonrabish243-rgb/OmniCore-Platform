import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";
import { isTokenUsed, sensitiveRateLimiter } from "@/lib/omnicaptcha";

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("login", clientId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, captchaToken } = body;

    if (!captchaToken || !isTokenUsed(captchaToken)) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      sensitiveRateLimiter.check(`captcha:abuse:${ip}`);
      return NextResponse.json({ error: "Vérification de sécurité échouée." }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    // Authenticate with Supabase
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error");
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "Profil utilisateur introuvable." },
        { status: 404 }
      );
    }

    if (!user.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Ce compte a été désactivé." },
        { status: 403 }
      );
    }

    // Update last login and status
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString(), online_status: "online" })
      .eq("id", user.id);

    // Log login
    await supabase.from("login_history").insert({
      user_id: user.id,
      success: true,
      method: "password",
    });

    // Set active workspace if exactly one workspace is available
    const cookieStore = await cookies();
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id);

    if (memberships && memberships.length > 0) {
      const orgIds = memberships.map((m) => m.organization_id);
      const { data: workspaces } = await supabase
        .from("workspaces")
        .select("*")
        .in("organization_id", orgIds)
        .eq("is_active", true);

      if (workspaces && workspaces.length === 1) {
        cookieStore.set("activeWorkspace", workspaces[0].id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login error");
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}

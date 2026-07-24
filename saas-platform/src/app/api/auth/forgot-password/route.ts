import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("forgot-password", clientId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const supabase = await createClient();

    const locale = request.url
      ? new URL(request.url).pathname.split("/")[1] || "fr"
      : "fr";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://omnicore.site";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/${locale}/reset-password`,
    });

    if (error) {
      console.error("Forgot password error");
    }

    return NextResponse.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Forgot password error");
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

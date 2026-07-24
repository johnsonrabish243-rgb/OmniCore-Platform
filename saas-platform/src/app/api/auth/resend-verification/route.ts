import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@insforge/sdk";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";
import { generateVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email-service";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || "";

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("resend-verification", clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 60 minutes." }, { status: 429 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, first_name, language")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "Email déjà vérifié" }, { status: 409 });
    }

    const vt = generateVerificationToken();
    const admin = createAdminClient({ baseUrl: INSFORGE_URL, apiKey: INSFORGE_API_KEY });

    await admin.database
      .from("verification_tokens")
      .insert([{
        user_id: userId,
        type: "email_verification",
        hashed_code: vt.hashedCode,
        hashed_token: vt.hashedToken,
        expires_at: vt.expiresAt.toISOString(),
        used: false,
      }]);

    const locale = (user.language as "fr" | "en" | "sw") || "fr";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://omnicore.site";
    const verificationLink = `${origin}/${locale}/verify-email?token=${vt.token}&userId=${userId}`;

    await sendVerificationEmail({
      to: user.email,
      name: user.first_name || "Utilisateur",
      code: vt.code,
      verificationLink,
      locale,
    });

    return NextResponse.json({ success: true, message: "Code de vérification envoyé." });
  } catch (error) {
    console.error("Resend verification error");
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}

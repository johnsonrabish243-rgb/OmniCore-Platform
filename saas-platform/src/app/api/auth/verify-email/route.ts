import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@insforge/sdk";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";
import { hashToken, isTokenExpired, timingSafeCompare } from "@/lib/verification-token";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || "";

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("verify-email", clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    const { userId, code } = await request.json();
    if (!userId || !code) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "email_verification")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Aucun code de vérification trouvé. Demandez-en un nouveau." }, { status: 404 });
    }

    if (isTokenExpired(tokenData.expires_at)) {
      return NextResponse.json({ error: "Le code a expiré. Demandez-en un nouveau." }, { status: 410 });
    }

    if (tokenData.used) {
      return NextResponse.json({ error: "Ce code a déjà été utilisé." }, { status: 409 });
    }

    const hashedCode = hashToken(code);
    if (!timingSafeCompare(hashedCode, tokenData.hashed_code)) {
      return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
    }

    const admin = createAdminClient({ baseUrl: INSFORGE_URL, apiKey: INSFORGE_API_KEY });

    await admin.database
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", tokenData.id);

    await admin.database
      .from("users")
      .update({ is_active: true, email_confirmed_at: new Date().toISOString() })
      .eq("id", userId);

    return NextResponse.json({ success: true, message: "Email vérifié avec succès !" });
  } catch (error) {
    console.error("Email verification error");
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}

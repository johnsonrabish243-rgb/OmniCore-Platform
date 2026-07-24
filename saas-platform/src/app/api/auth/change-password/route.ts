import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête non autorisée" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("change-password", clientId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives" },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json({ error: "Nouveau mot de passe requis" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Change password error");
      return NextResponse.json({ error: "Erreur lors du changement de mot de passe" }, { status: 400 });
    }

    return NextResponse.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Change password error");
    return NextResponse.json({ error: "Erreur lors du changement de mot de passe" }, { status: 500 });
  }
}

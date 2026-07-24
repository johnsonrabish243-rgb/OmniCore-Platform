import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Nouveau mot de passe requis" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    // With Supabase, the reset flow uses the recovery token from the URL hash
    // The user is redirected here with a hash token already set in the session cookie
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Reset password error");
      return NextResponse.json({ error: "Token invalide ou expiré. Veuillez refaire une demande de réinitialisation." }, { status: 400 });
    }

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Reset password error");
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

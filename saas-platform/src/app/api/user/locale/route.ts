import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateCSRFRequest } from "@/lib/csrf";

export async function PUT(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { locale } = await request.json();
    if (!["fr", "en", "sw"].includes(locale)) {
      return NextResponse.json({ error: "Langue invalide" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .update({ language: locale })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating user locale");
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Locale update error");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

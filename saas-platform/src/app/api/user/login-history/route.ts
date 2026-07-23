import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: history } = await supabase
      .from("login_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error("Login history fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

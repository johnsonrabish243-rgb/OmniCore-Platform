import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: logs } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error("Failed to fetch audit logs");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

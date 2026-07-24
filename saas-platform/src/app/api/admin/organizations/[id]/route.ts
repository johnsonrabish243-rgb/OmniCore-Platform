import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: organization } = await supabase
      .from("organizations")
      .select("*, billing(*), members:organization_members(*)")
      .eq("id", id)
      .single();

    if (!organization) {
      return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Failed to fetch organization");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

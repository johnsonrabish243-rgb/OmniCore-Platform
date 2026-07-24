import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabase = await createClient();

    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id);

    const orgIds = memberships?.map((m) => m.organization_id) || [];

    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("*")
      .in("organization_id", orgIds)
      .eq("is_active", true)
      .order("name", { ascending: true });

    return NextResponse.json({ workspaces: workspaces || [] });
  } catch (error) {
    console.error("Failed to fetch workspaces");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const supabase = await createClient();
    const body = await request.json();
    const { organizationId, name, slug, description, type } = body;

    if (!organizationId || !name || !slug) {
      return NextResponse.json({ error: "organizationId, name, slug requis" }, { status: 400 });
    }

    // Check permissions
    const { data: membership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("is_owner", true)
      .single();

    if (!membership && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .insert({ organization_id: organizationId, name, slug, description, type })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Failed to create workspace");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

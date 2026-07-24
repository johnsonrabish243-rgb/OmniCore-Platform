import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: organizations } = await supabase
      .from("organizations")
      .select("*, billing:tier, members:organization_members(count)")
      .order("created_at", { ascending: false });

    const mapped = (organizations || []).map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      members: org.members?.[0]?.count || 0,
      plan: org.tier || "FREE",
      status: org.is_active ? "active" : "suspended",
      createdAt: org.created_at,
    }));

    return NextResponse.json({ organizations: mapped });
  } catch (error) {
    console.error("Failed to fetch organizations");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { name } = body;

    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data: org } = await supabase
      .from("organizations")
      .insert({ name, slug: slug || `org-${Date.now()}` })
      .select()
      .single();

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error("Failed to create organization");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const { data: memberships } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id);
    const orgIds = memberships?.map((m) => m.organization_id) || [];

    const { data: webhooks } = await supabase.from("webhooks").select("*, deliveries:webhook_deliveries(*)").in("organization_id", orgIds).order("created_at", { ascending: false });

    return NextResponse.json({ webhooks: webhooks || [] });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const body = await request.json();
    const { data: webhook } = await supabase
      .from("webhooks")
      .insert({
        organization_id: membership.organization_id,
        name: body.name,
        url: body.url,
        events: body.events,
        secret: body.secret,
        is_active: body.isActive,
      })
      .select()
      .single();

    return NextResponse.json({ webhook });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    await supabase.from("webhooks").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id);

    const orgIds = memberships?.map((m) => m.organization_id) || [];

    const { data: deals } = await supabase
      .from("deals")
      .select("*, contact:contacts(id, first_name, last_name, company)")
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false });

    const mapped = (deals || []).map((deal: any) => ({
      id: deal.id,
      title: deal.title,
      company: deal.contact?.company || (deal.contact ? `${deal.contact.first_name || ""} ${deal.contact.last_name || ""}`.trim() : "Sans contact"),
      value: new Intl.NumberFormat("fr-FR", { style: "currency", currency: deal.currency || "EUR" }).format(Number(deal.value)),
      stage: deal.stage,
      probability: deal.probability,
      contactId: deal.contact_id,
      currency: deal.currency,
      expectedCloseDate: deal.expected_close_date,
      notes: deal.notes,
      source: deal.source,
    }));

    return NextResponse.json({ deals: mapped });
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

    const body = await request.json();
    const { organizationId, title, value, currency, contactId, probability, expectedCloseDate, notes, source } = body;

    if (!organizationId || !title) {
      return NextResponse.json({ error: "organizationId et title requis" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single();

    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const { data: deal } = await supabase
      .from("deals")
      .insert({
        organization_id: organizationId,
        title,
        value: value || 0,
        currency: currency || "EUR",
        stage: "LEAD",
        probability: probability || 0,
        contact_id: contactId || null,
        expected_close_date: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : null,
        notes,
        source,
        created_by_id: user.id,
        assigned_to_id: user.id,
      })
      .select("*, contact:contacts(id, first_name, last_name, company)")
      .single();

    return NextResponse.json({ deal });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { id, stage, value, probability, contactId, expectedCloseDate, notes, title } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const updateData: Record<string, any> = {};
    if (stage) updateData.stage = stage;
    if (typeof value === "number") updateData.value = value;
    if (typeof probability === "number") updateData.probability = probability;
    if (contactId) updateData.contact_id = contactId;
    if (expectedCloseDate) updateData.expected_close_date = new Date(expectedCloseDate).toISOString();
    if (notes !== undefined) updateData.notes = notes;
    if (title) updateData.title = title;

    const { data: deal } = await supabase
      .from("deals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json({ deal });
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

    await supabase.from("deals").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

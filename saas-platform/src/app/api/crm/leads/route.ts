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

    const { data: leads } = await supabase
      .from("leads")
      .select("*, assigned_to:users!leads_assigned_to_id_fkey(id, first_name, last_name)")
      .in("organization_id", orgIds)
      .order("created_at", { ascending: false });

    const mapped = (leads || []).map((lead: any) => ({
      id: lead.id,
      name: `${lead.first_name || ""} ${lead.last_name || ""}`.trim(),
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      jobTitle: lead.job_title,
      source: lead.source,
      status: lead.status,
      score: lead.score,
      notes: lead.notes,
      assignedTo: lead.assigned_to ? `${lead.assigned_to.first_name || ""} ${lead.assigned_to.last_name || ""}`.trim() : null,
      createdAt: lead.created_at,
    }));

    return NextResponse.json({ leads: mapped });
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
    const { organizationId, firstName, lastName, email, phone, company, jobTitle, source, status, score, notes, assignedToId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single();

    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const { data: lead } = await supabase
      .from("leads")
      .insert({
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        company,
        job_title: jobTitle,
        source,
        status: status || "new",
        score: score || 0,
        notes,
        assigned_to_id: assignedToId || user.id,
        created_by_id: user.id,
      })
      .select()
      .single();

    return NextResponse.json({ lead });
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
    const { id, firstName, lastName, email, phone, company, jobTitle, source, status, score, notes, assignedToId } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const updateData: Record<string, any> = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (jobTitle !== undefined) updateData.job_title = jobTitle;
    if (source !== undefined) updateData.source = source;
    if (status !== undefined) updateData.status = status;
    if (score !== undefined) updateData.score = score;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedToId !== undefined) updateData.assigned_to_id = assignedToId;

    const { data: lead } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json({ lead });
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

    await supabase.from("leads").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

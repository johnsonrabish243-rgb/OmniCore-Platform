import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const body = await request.json();
  const { organizationId, firstName, lastName, email, phone, company, jobTitle, source, status, score, notes, assignedToId } = body;

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

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
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const updateData: Record<string, any> = {};
  if (data.firstName !== undefined) updateData.first_name = data.firstName;
  if (data.lastName !== undefined) updateData.last_name = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.score !== undefined) updateData.score = data.score;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.assignedToId !== undefined) updateData.assigned_to_id = data.assignedToId;

  const { data: lead } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ lead });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await supabase.from("leads").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

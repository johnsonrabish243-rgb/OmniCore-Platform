import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";

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

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*, created_by:users!contacts_created_by_id_fkey(id, first_name, last_name)")
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  const mapped = (contacts || []).map((c: any) => ({
    id: c.id,
    name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
    email: c.email,
    phone: c.phone,
    jobTitle: c.job_title,
    company: c.company,
    source: c.source,
    notes: c.notes,
    dealsCount: 0,
    createdBy: c.created_by ? `${c.created_by.first_name || ""} ${c.created_by.last_name || ""}`.trim() : null,
    createdAt: c.created_at,
  }));

  return NextResponse.json({ contacts: mapped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const moduleCheck = await requireModule("crm");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const body = await request.json();
  const { organizationId, firstName, lastName, email, phone, jobTitle, company, notes, source } = body;

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const { data: contact } = await supabase
    .from("contacts")
    .insert({
      organization_id: organizationId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      job_title: jobTitle,
      company,
      notes,
      source,
      created_by_id: user.id,
    })
    .select()
    .single();

  return NextResponse.json({ contact });
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
  if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.source !== undefined) updateData.source = data.source;

  const { data: contact } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ contact });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await supabase.from("contacts").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { getCurrentUser, getActiveWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (!employee) {
    return NextResponse.json({ error: "Employé introuvable" }, { status: 404 });
  }

  return NextResponse.json({ employee });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .update({
      ...(body.firstName && { first_name: body.firstName }),
      ...(body.lastName && { last_name: body.lastName }),
      ...(body.email && { email: body.email }),
      ...(body.phone && { phone: body.phone }),
      ...(body.jobTitle && { job_title: body.jobTitle }),
      ...(body.department && { department: body.department }),
      ...(body.salary !== undefined && { salary: body.salary }),
      ...(body.status && { status: body.status }),
    })
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ employee });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  await supabase.from("employees").delete().eq("id", id);

  return NextResponse.json({ success: true });
}

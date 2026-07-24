import { NextResponse } from "next/server";
import { getCurrentUser, getActiveWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updateData: Record<string, any> = {};
    if (body.firstName !== undefined) updateData.first_name = body.firstName;
    if (body.lastName !== undefined) updateData.last_name = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.jobTitle !== undefined) updateData.job_title = body.jobTitle;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.salary !== undefined) updateData.salary = body.salary;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: employee } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json({ employee });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { id } = await params;
    const supabase = await createClient();

    await supabase.from("employees").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

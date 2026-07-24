import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

  const { data: memberships } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id);
  const orgIds = memberships?.map((m) => m.organization_id) || [];

  const { data: students } = await supabase.from("students").select("*, class:classes(*)").in("organization_id", orgIds).order("created_at", { ascending: false });

  return NextResponse.json({ students: students || [] });
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
    const { data: student } = await supabase
      .from("students")
      .insert({
        organization_id: membership.organization_id,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        date_of_birth: body.dateOfBirth,
        class_id: body.classId,
        enrollment_date: body.enrollmentDate,
        parent_name: body.parentName,
        parent_phone: body.parentPhone,
      })
      .select()
      .single();

    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

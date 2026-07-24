import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

  const { data: memberships } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id);
  const orgIds = memberships?.map((m) => m.organization_id) || [];

  const { data: courses } = await supabase.from("courses").select("*, class:classes(*)").in("organization_id", orgIds).order("name");

  return NextResponse.json({ courses: courses || [] });
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
    const { data: course } = await supabase
      .from("courses")
      .insert({
        organization_id: membership.organization_id,
        name: body.name,
        code: body.code,
        description: body.description,
        class_id: body.classId,
        teacher_id: body.teacherId,
        credits: body.credits,
        schedule: body.schedule,
      })
      .select()
      .single();

    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

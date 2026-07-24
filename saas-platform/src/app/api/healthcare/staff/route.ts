import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

  const { data: memberships } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id);
  const orgIds = memberships?.map((m) => m.organization_id) || [];

  const { data: staff } = await supabase.from("staff_members").select("*").in("organization_id", orgIds).order("created_at", { ascending: false });

  return NextResponse.json({ staff: staff || [] });
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
    const { data: member } = await supabase
      .from("staff_members")
      .insert({
        organization_id: membership.organization_id,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        role: body.role,
        department: body.department,
        specialization: body.specialization,
        hire_date: body.hireDate,
      })
      .select()
      .single();

    return NextResponse.json({ staff: member });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

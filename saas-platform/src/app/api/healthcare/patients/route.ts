import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

  const { data: memberships } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id);
  const orgIds = memberships?.map((m) => m.organization_id) || [];

  const { data: patients } = await supabase.from("patients").select("*").in("organization_id", orgIds).order("created_at", { ascending: false });

  return NextResponse.json({ patients: patients || [] });
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
    const { data: patient } = await supabase
      .from("patients")
      .insert({
        organization_id: membership.organization_id,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        date_of_birth: body.dateOfBirth,
        gender: body.gender,
        address: body.address,
        blood_type: body.bloodType,
        allergies: body.allergies,
        emergency_contact: body.emergencyContact,
      })
      .select()
      .single();

    return NextResponse.json({ patient });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

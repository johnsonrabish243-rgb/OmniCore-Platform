import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

  const { data: memberships } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id);
  const orgIds = memberships?.map((m) => m.organization_id) || [];

  const { data: appointments } = await supabase.from("appointments").select("*").in("organization_id", orgIds).order("created_at", { ascending: false });

  return NextResponse.json({ appointments: appointments || [] });
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
    const { data: appointment } = await supabase
      .from("appointments")
      .insert({
        organization_id: membership.organization_id,
        patient_id: body.patientId,
        staff_id: body.staffId,
        appointment_date: body.appointmentDate,
        duration: body.duration,
        type: body.type,
        status: body.status,
        notes: body.notes,
      })
      .select()
      .single();

    return NextResponse.json({ appointment });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

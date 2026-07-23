import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({ user: profile });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data: updated } = await supabase
    .from("users")
    .update({
      ...(body.firstName && { first_name: body.firstName }),
      ...(body.lastName && { last_name: body.lastName }),
      ...(body.email && { email: body.email }),
      ...(body.role && { role: body.role }),
      ...(body.isActive !== undefined && { is_active: body.isActive }),
    })
    .eq("id", id)
    .select()
    .single();

  if (!updated) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ user: updated });
}

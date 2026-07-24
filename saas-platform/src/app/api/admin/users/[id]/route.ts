import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (error) {
    console.error("Failed to fetch user");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "VIEWER", "OWNER", "MEMBER"];

    const updateData: Record<string, unknown> = {};
    if (body.firstName) updateData.first_name = body.firstName;
    if (body.lastName) updateData.last_name = body.lastName;
    if (body.email) updateData.email = body.email;
    if (body.role) {
      if (!VALID_ROLES.includes(body.role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      updateData.role = body.role;
    }
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data: updated } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (!updated) {
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Failed to update user");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

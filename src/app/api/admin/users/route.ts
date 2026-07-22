import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role, is_active, created_at, avatar_url")
    .order("created_at", { ascending: false });

  return NextResponse.json({ users: users || [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, firstName, lastName, role } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const supabase = await createClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }

  // Create profile in users table
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email,
    first_name: firstName || "",
    last_name: lastName || "",
    role: role || "EMPLOYEE",
    language: "fr",
    timezone: "Europe/Paris",
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: "Erreur lors de la création du profil" }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: authData.user.id,
      email,
      firstName,
      lastName,
      role: role || "EMPLOYEE",
    },
  });
}

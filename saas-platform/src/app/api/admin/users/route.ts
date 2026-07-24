import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { validateCSRFRequest } from "@/lib/csrf";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("Failed to fetch users");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête non autorisée" }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

  const body = await request.json();
  const { email, password, firstName, lastName, role } = body;

  const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "VIEWER"];

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  if (role && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." },
      { status: 400 }
    );
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
  } catch (error) {
    console.error("Failed to create user");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

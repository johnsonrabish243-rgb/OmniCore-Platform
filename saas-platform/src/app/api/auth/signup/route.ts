import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // Check if current user is already authenticated (admin creating account for someone else)
    const currentUser = await getCurrentUser();

    const body = await request.json();
    const { email, password, firstName, lastName, companyName } = body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes("already")) {
        return NextResponse.json(
          { error: "Un compte avec cet email existe déjà." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Erreur lors de la création du compte." },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Erreur lors de la création du compte." },
        { status: 500 }
      );
    }

    // Assign role - default to EMPLOYEE for self-registration
    const role = currentUser?.role === "SUPER_ADMIN" ? (body.role || "EMPLOYEE") : "EMPLOYEE";

    // Create user profile in our users table
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      language: "fr",
      timezone: "Europe/Paris",
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Erreur lors de la création du profil." },
        { status: 500 }
      );
    }

    // If company name provided, create organization
    if (companyName) {
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: companyName,
          slug: slug || `org-${authData.user.id.slice(0, 8)}`,
        })
        .select()
        .single();

      if (org && !orgError) {
        await supabase.from("organization_members").insert({
          organization_id: org.id,
          user_id: authData.user.id,
          role: "OWNER",
          is_owner: true,
        });
      }
    }

    // For admin-created users, don't sign them in (admin stays logged in)
    // For self-registration, the session is already set by Supabase

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email,
        firstName,
        lastName,
        role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}

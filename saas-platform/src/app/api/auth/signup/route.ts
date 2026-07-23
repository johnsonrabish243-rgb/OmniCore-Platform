import { NextResponse } from "next/server";
import { createClient as createInsforgeClient, createAdminClient } from "@insforge/sdk";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY!;

/**
 * Signup profile creation route.
 * Auth is already handled by the browser client (signUp sets cookies).
 * This route only creates the user profile + organization in the database
 * using the admin client (bypasses RLS).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, firstName, lastName, companyName, workspace } = body;

    // Validate input
    if (!userId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    // Use admin client to create profile (bypasses RLS)
    const admin = createAdminClient({
      baseUrl: INSFORGE_URL,
      apiKey: INSFORGE_API_KEY,
    });

    // Create user profile in our users table
    const { error: profileError } = await admin.database.from("users").insert([{
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "EMPLOYEE",
      language: "fr",
      timezone: "Europe/Paris",
    }]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
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

      const { data: org, error: orgError } = await admin.database
        .from("organizations")
        .insert([{
          name: companyName,
          slug: slug || `org-${userId.slice(0, 8)}`,
        }])
        .select()
        .single();

      if (org && !orgError) {
        await admin.database.from("organization_members").insert([{
          organization_id: org.id,
          user_id: userId,
          role: "OWNER",
          is_owner: true,
        }]);
      }
    }

    return NextResponse.json({
      user: {
        id: userId,
        email,
        firstName,
        lastName,
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

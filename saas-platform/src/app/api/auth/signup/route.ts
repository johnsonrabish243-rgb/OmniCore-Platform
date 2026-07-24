import { NextResponse } from "next/server";
import { createAdminClient } from "@insforge/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY!;

/**
 * Signup route that:
 * 1. Creates the auth user via SDK client (auto-confirm if platform allows)
 * 2. Creates user profile in the users table
 * 3. Creates organization + workspace if company name provided
 * 4. Sets up workspace with default modules
 */
export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("signup", clientId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, firstName, lastName, companyName, workspace } = body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre." },
        { status: 400 }
      );
    }

    // Use admin client for privileged operations
    const admin = createAdminClient({
      baseUrl: INSFORGE_URL,
      apiKey: INSFORGE_API_KEY,
    });

    // Step 1: Create auth user via the standard server client
    // The InsForge/Supabase admin client's signUp method creates the user
    // If the platform has email confirmation disabled, the user is auto-confirmed
    const regularClient = await createClient();
    const { data: signUpData, error: signUpError } = await regularClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (signUpError) {
      const message = String(signUpError?.message || "");
      if (message.includes("already") || message.includes("existe") || message.includes("registered")) {
        return NextResponse.json(
          { error: "Un compte avec cet email existe déjà." },
          { status: 409 }
        );
      }
      console.error("Auth signup error");
      return NextResponse.json(
        { error: "Erreur lors de la création du compte." },
        { status: 500 }
      );
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Erreur lors de la création du compte." },
        { status: 500 }
      );
    }

    // Try to auto-confirm the user using admin client
    try {
      await admin.database
        .from("users")
        .update({ is_active: true })
        .eq("id", userId);
    } catch {}

    // Step 2: Create user profile in our users table
    const { error: profileError } = await admin.database.from("users").insert([{
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "EMPLOYEE",
      language: "fr",
      timezone: "Europe/Paris",
      is_active: true,
    }]);

    if (profileError) {
      console.error("Profile creation error");
    }

    let orgId: string | null = null;

    // Step 3: Create organization if company name provided
    if (companyName) {
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `org-${userId.slice(0, 8)}`;

      const { data: org, error: orgError } = await admin.database
        .from("organizations")
        .insert([{
          name: companyName,
          slug,
        }])
        .select()
        .single();

      if (org && !orgError) {
        orgId = org.id;

        // Add user as owner
        await admin.database.from("organization_members").insert([{
          organization_id: org.id,
          user_id: userId,
          role: "OWNER",
          is_owner: true,
        }]);

        // Step 4: Create default workspace
        const wsSlug = (companyName + "-workspace")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `ws-${userId.slice(0, 8)}`;

        const { data: ws, error: wsError } = await admin.database
          .from("workspaces")
          .insert([{
            organization_id: org.id,
            name: `${companyName} - Espace principal`,
            slug: wsSlug,
            settings: JSON.stringify({
              enabledModules: workspace ? [workspace] : ["hr", "finance", "crm", "commerce", "sales", "inventory", "pharmacy", "education", "healthcare", "projects", "tasks", "calendar", "messages", "documents"],
            }),
            is_active: true,
          }])
          .select()
          .single();

        if (ws && !wsError) {
          // Add user as workspace member
          await admin.database.from("workspace_members").insert([{
            workspace_id: ws.id,
            user_id: userId,
            role: "OWNER",
          }]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
      },
      organization: orgId ? { id: orgId } : null,
    });
  } catch (error) {
    console.error("Signup error");
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@insforge/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { validateCSRFRequest } from "@/lib/csrf";
import { generateVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email-service";

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "";
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY || "";

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_LOCALES = ["fr", "en", "sw"];
const VALID_MODULES = [
  "hr", "finance", "crm", "commerce", "sales", "inventory",
  "pharmacy", "education", "healthcare", "projects", "tasks",
  "calendar", "messages", "documents",
];

export async function POST(request: Request) {
  try {
    if (!validateCSRFRequest(request)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 403 });
    }

    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit("signup", clientId);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Veuillez réessayer plus tard." }, { status: 429 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, companyName, locale, selectedModule } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    }

    if (!VALID_EMAIL.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (email.length > 254) {
      return NextResponse.json({ error: "Adresse email trop longue." }, { status: 400 });
    }

    if (firstName.length > 100 || lastName.length > 100) {
      return NextResponse.json({ error: "Le nom ne peut pas dépasser 100 caractères." }, { status: 400 });
    }

    if (companyName && companyName.length > 200) {
      return NextResponse.json({ error: "Le nom de l'entreprise ne peut pas dépasser 200 caractères." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    if (password.length > 128) {
      return NextResponse.json({ error: "Le mot de passe est trop long." }, { status: 400 });
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre." }, { status: 400 });
    }

    if (!body.acceptedTerms) {
      return NextResponse.json({ error: "Vous devez accepter les conditions d'utilisation." }, { status: 400 });
    }

    if (!selectedModule || !VALID_MODULES.includes(selectedModule)) {
      return NextResponse.json({ error: "Veuillez sélectionner un module valide." }, { status: 400 });
    }

    const userLocale = ALLOWED_LOCALES.includes(locale) ? locale : "fr";

    const admin = createAdminClient({ baseUrl: INSFORGE_URL, apiKey: INSFORGE_API_KEY });
    const regularClient = await createClient();

    const { data: signUpData, error: signUpError } = await regularClient.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });

    if (signUpError) {
      const msg = String(signUpError?.message || "");
      console.error("Auth signup error:", msg);
      if (msg.includes("already") || msg.includes("existe") || msg.includes("registered")) {
        return NextResponse.json({ error: "Un compte avec cet email existe déjà." }, { status: 409 });
      }
      return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
    }

    const company = companyName?.trim() || `${firstName} ${lastName}`;

    const { error: profileError } = await admin.database.from("users").insert([{
      id: userId,
      email: email.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: "EMPLOYEE",
      language: userLocale,
      is_active: false,
      email_confirmed_at: null,
      preferred_module: selectedModule,
    }]);

    if (profileError) {
      console.error("Profile creation error:", profileError.message);
    }

    const vt = generateVerificationToken();

    const { error: tokenError } = await admin.database
      .from("verification_tokens")
      .insert([{
        user_id: userId,
        type: "email_verification",
        hashed_code: vt.hashedCode,
        hashed_token: vt.hashedToken,
        expires_at: vt.expiresAt.toISOString(),
        used: false,
      }]);

    if (tokenError) {
      console.error("Verification token insert error:", tokenError.message);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://omnicore.site";
    const verificationLink = `${origin}/${userLocale}/verify-email?token=${vt.token}&userId=${userId}`;

    const emailSent = await sendVerificationEmail({
      to: email,
      name: firstName,
      code: vt.code,
      verificationLink,
      locale: userLocale as "fr" | "en" | "sw",
    });

    let orgId: string | null = null;
    let workspaceSlug: string | null = null;

    try {
      const slug = company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `org-${userId.slice(0, 8)}`;

      const { data: org, error: orgError } = await admin.database
        .from("organizations")
        .insert([{ name: company, slug }])
        .select()
        .single();

      if (org) {
        orgId = org.id;

        await admin.database.from("organization_members").insert([{
          organization_id: org.id,
          user_id: userId,
          role: "OWNER",
          is_owner: true,
        }]);

        const wsSlug = `${company}-${selectedModule}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `ws-${userId.slice(0, 8)}`;

        const { data: ws, error: wsError } = await admin.database
          .from("workspaces")
          .insert([{
            organization_id: org.id,
            name: `${company} - ${selectedModule}`,
            slug: wsSlug,
            settings: JSON.stringify({
              enabledModules: [selectedModule],
              preferredModule: selectedModule,
              currency: "USD",
              language: userLocale,
              timezone: "Africa/Lubumbashi",
              industry: "",
              createdBy: userId,
            }),
            is_active: true,
          }])
          .select()
          .single();

        if (ws) {
          workspaceSlug = ws.slug;
          await admin.database.from("workspace_members").insert([{
            workspace_id: ws.id,
            user_id: userId,
            role: "OWNER",
          }]);
        }
        if (wsError) console.error("Workspace creation error:", wsError.message);
      }
      if (orgError) console.error("Organization creation error:", orgError.message);
    } catch (orgErr) {
      console.error("Org/workspace setup error:", String(orgErr));
    }

    return NextResponse.json({
      success: true,
      verificationRequired: true,
      emailSent,
      preferredModule: selectedModule,
      user: { id: userId, email, firstName, lastName },
      organization: orgId ? { id: orgId } : null,
      redirectTo: `/${userLocale}/verify-email?token=${vt.token}&userId=${userId}`,
    });
  } catch (error) {
    console.error("Signup error:", String(error));
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth-helpers";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const {
      organizationId,
      organizationName,
      workspaceName,
      industry,
      country,
      currency,
      language,
      timezone,
      logoUrl,
    } = body;

    if (!workspaceName || workspaceName.trim().length === 0) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    let organization: any;
    let orgId = organizationId;

    if (orgId) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", orgId)
        .eq("user_id", user.id)
        .single();

      if (!membership && user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }

      const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();
      if (!org) {
        return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 });
      }
      organization = org;
    } else {
      if (!organizationName || organizationName.trim().length === 0) {
        return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
      }

      const slugBase = slugify(organizationName);
      const slug = slugBase || `org-${Date.now()}`;
      const { data: existingOrg } = await supabase.from("organizations").select("id").eq("slug", slug).single();
      const uniqueSlug = existingOrg ? `${slug}-${Date.now()}` : slug;

      const { data: org } = await supabase
        .from("organizations")
        .insert({
          name: organizationName.trim(),
          slug: uniqueSlug,
          industry: industry?.trim() || null,
          settings: {
            country: country?.trim() || null,
            currency: currency || null,
            language: language || null,
            timezone: timezone || null,
            onboardingCompleted: true,
          },
          logo_url: logoUrl || null,
        })
        .select()
        .single();

      if (org) {
        orgId = org.id;
        await supabase.from("organization_members").insert({
          organization_id: orgId,
          user_id: user.id,
          role: "OWNER",
          is_owner: true,
        });
        organization = org;
      }
    }

    const workspaceSlugBase = slugify(workspaceName);
    const workspaceSlug = workspaceSlugBase || `workspace-${Date.now()}`;
    const { data: existingWorkspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("organization_id", orgId!)
      .eq("slug", workspaceSlug)
      .single();

    const uniqueWorkspaceSlug = existingWorkspace ? `${workspaceSlug}-${Date.now()}` : workspaceSlug;

    const { data: workspace } = await supabase
      .from("workspaces")
      .insert({
        organization_id: orgId!,
        name: workspaceName.trim(),
        slug: uniqueWorkspaceSlug,
        description: body.description?.trim() || null,
        type: body.type?.trim() || "Workspace",
        settings: {
          currency: currency || null,
          language: language || null,
          timezone: timezone || null,
          industry: industry?.trim() || null,
          createdBy: user.id,
        },
        is_active: true,
      })
      .select()
      .single();

    const cookieStore = await cookies();
    cookieStore.set("activeWorkspace", workspace?.id || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ organization, workspace }, { status: 201 });
  } catch (error) {
    console.error("Workspace onboarding error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'espace de travail." },
      { status: 500 }
    );
  }
}

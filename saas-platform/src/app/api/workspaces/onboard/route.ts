import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
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

    let organization;
    let orgId = organizationId;

    if (orgId) {
      const membership = await prisma.organizationMember.findFirst({
        where: { organizationId: orgId, userId: user.id },
      });
      if (!membership && user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
      organization = await prisma.organization.findUnique({ where: { id: orgId } });
      if (!organization) {
        return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 });
      }
    } else {
      if (!organizationName || organizationName.trim().length === 0) {
        return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
      }
      const slugBase = slugify(organizationName);
      const slug = slugBase || `org-${Date.now()}`;
      const existingOrg = await prisma.organization.findUnique({ where: { slug } });
      const uniqueSlug = existingOrg ? `${slug}-${Date.now()}` : slug;

      organization = await prisma.organization.create({
        data: {
          name: organizationName.trim(),
          slug: uniqueSlug,
          industry: industry?.trim() || undefined,
          settings: {
            country: country?.trim() || undefined,
            currency: currency || undefined,
            language: language || undefined,
            timezone: timezone || undefined,
            onboardingCompleted: true,
          },
          logoUrl: logoUrl || undefined,
        },
      });

      orgId = organization.id;
      await prisma.organizationMember.create({
        data: {
          organizationId: orgId,
          userId: user.id,
          role: "OWNER",
          isOwner: true,
        },
      });
    }

    const workspaceSlugBase = slugify(workspaceName);
    const workspaceSlug = workspaceSlugBase || `workspace-${Date.now()}`;
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { organizationId: orgId!, slug: workspaceSlug },
    });
    const uniqueWorkspaceSlug = existingWorkspace
      ? `${workspaceSlug}-${Date.now()}`
      : workspaceSlug;

    const workspace = await prisma.workspace.create({
      data: {
        organizationId: orgId!,
        name: workspaceName.trim(),
        slug: uniqueWorkspaceSlug,
        description: body.description?.trim() || undefined,
        type: body.type?.trim() || "Workspace",
        settings: {
          currency: currency || undefined,
          language: language || undefined,
          timezone: timezone || undefined,
          industry: industry?.trim() || undefined,
          createdBy: user.id,
        },
        isActive: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("activeWorkspace", workspace.id, {
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

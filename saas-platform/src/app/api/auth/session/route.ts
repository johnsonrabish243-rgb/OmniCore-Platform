import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getActiveWorkspace, getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true, tier: true },
        },
      },
    });

    const activeWorkspace = await getActiveWorkspace();

    // Parse workspace settings for enabled modules
    let enabledModules: string[] = [];
    if (activeWorkspace?.settings) {
      const settings = typeof activeWorkspace.settings === "string"
        ? JSON.parse(activeWorkspace.settings)
        : activeWorkspace.settings;
      enabledModules = settings.enabledModules || [];
    }

    return NextResponse.json({
      user: {
        ...user,
        organizations: memberships.map((m) => ({
          ...m.organization,
          role: m.role,
          isOwner: m.isOwner,
        })),
        activeWorkspace: activeWorkspace
          ? {
              id: activeWorkspace.id,
              name: activeWorkspace.name,
              slug: activeWorkspace.slug,
              organizationId: activeWorkspace.organizationId,
              settings: activeWorkspace.settings,
              enabledModules,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

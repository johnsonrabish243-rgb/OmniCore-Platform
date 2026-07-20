import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/auth-helpers";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const body = await request.json();

    // If client requests to set an active workspace, validate membership and set cookie
    if (body.activeWorkspaceId) {
      const workspace = await prisma.workspace.findUnique({ where: { id: body.activeWorkspaceId } });
      if (!workspace || !workspace.isActive) return NextResponse.json({ error: "Workspace introuvable" }, { status: 404 });

      const membership = await prisma.organizationMember.findFirst({ where: { userId: payload.userId as string, organizationId: workspace.organizationId } });
      if (!membership && payload.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

      cookieStore.set("activeWorkspace", body.activeWorkspaceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.bio && { bio: body.bio }),
        ...(body.language && { language: body.language }),
        ...(body.timezone && { timezone: body.timezone }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, bio: true, language: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

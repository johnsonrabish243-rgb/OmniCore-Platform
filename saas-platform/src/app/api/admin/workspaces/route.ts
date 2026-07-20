import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  const workspaces = await prisma.workspace.findMany({
    where: { organizationId: { in: orgIds }, isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { organizationId, name, slug, description, type } = body;

  if (!organizationId || !name || !slug) {
    return NextResponse.json({ error: "organizationId, name, slug requis" }, { status: 400 });
  }

  // Check permissions
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isOwner: true },
  });

  if (!membership && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const workspace = await prisma.workspace.create({
    data: { organizationId, name, slug, description, type },
  });

  return NextResponse.json({ workspace });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  const orgIds = memberships.map((m) => m.organizationId);

  const where = organizationId ? { organizationId } : { organizationId: { in: orgIds } };
  const classes = await prisma.class.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ classes, total: classes.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, name, level, room, schedule, status } = body;
  if (!organizationId || !name) {
    return NextResponse.json({ error: "organizationId et name requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const cls = await prisma.class.create({
    data: { organizationId, name, level, room, schedule, status: status || "active" },
  });

  return NextResponse.json({ class: cls });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: cls.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.class.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.level !== undefined && { level: data.level }),
      ...(data.room !== undefined && { room: data.room }),
      ...(data.schedule !== undefined && { schedule: data.schedule }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return NextResponse.json({ class: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: cls.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

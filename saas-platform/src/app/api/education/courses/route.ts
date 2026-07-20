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
  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ courses, total: courses.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, classId, name, code, teacherName, schedule, room, status } = body;
  if (!organizationId || !name) {
    return NextResponse.json({ error: "organizationId et name requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const course = await prisma.course.create({
    data: { organizationId, classId, name, code, teacherName, schedule, room, status: status || "active" },
  });

  return NextResponse.json({ course });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: course.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.code !== undefined && { code: data.code }),
      ...(data.teacherName !== undefined && { teacherName: data.teacherName }),
      ...(data.schedule !== undefined && { schedule: data.schedule }),
      ...(data.room !== undefined && { room: data.room }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.classId !== undefined && { classId: data.classId }),
    },
  });

  return NextResponse.json({ course: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: course.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

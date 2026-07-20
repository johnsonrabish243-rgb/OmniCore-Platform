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
  const teachers = await prisma.teacher.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ teachers, total: teachers.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, firstName, lastName, email, subject, status } = body;
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const teacher = await prisma.teacher.create({
    data: {
      organizationId,
      firstName,
      lastName,
      email,
      subject,
      status: status || "active",
    },
  });

  return NextResponse.json({ teacher });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return NextResponse.json({ error: "Enseignant introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: teacher.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.teacher.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  return NextResponse.json({ teacher: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return NextResponse.json({ error: "Enseignant introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: teacher.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.teacher.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

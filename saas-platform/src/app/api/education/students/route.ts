import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";

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
  const students = await prisma.student.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ students, total: students.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const moduleCheck = await requireModule("education");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const body = await request.json();
  const { organizationId, classId, firstName, lastName, email, grade, attendance, status } = body;
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const student = await prisma.student.create({
    data: {
      organizationId,
      classId,
      firstName,
      lastName,
      email,
      grade,
      attendance: attendance || 0,
      status: status || "active",
    },
  });

  return NextResponse.json({ student });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: student.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.student.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.grade !== undefined && { grade: data.grade }),
      ...(data.attendance !== undefined && { attendance: data.attendance }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.classId !== undefined && { classId: data.classId }),
    },
  });

  return NextResponse.json({ student: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: student.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

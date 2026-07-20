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
  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ patients, total: patients.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const moduleCheck = await requireModule("healthcare");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const body = await request.json();
  const { organizationId, firstName, lastName, email, phone, age, gender, bloodType, condition, status, lastVisit, doctor } = body;
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const patient = await prisma.patient.create({
    data: {
      organizationId,
      firstName,
      lastName,
      email,
      phone,
      age: age || 0,
      gender,
      bloodType,
      condition,
      status: status || "stable",
      lastVisit,
      doctor,
    },
  });

  return NextResponse.json({ patient });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: patient.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.patient.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.age !== undefined && { age: data.age }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.bloodType !== undefined && { bloodType: data.bloodType }),
      ...(data.condition !== undefined && { condition: data.condition }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.lastVisit !== undefined && { lastVisit: data.lastVisit }),
      ...(data.doctor !== undefined && { doctor: data.doctor }),
    },
  });

  return NextResponse.json({ patient: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return NextResponse.json({ error: "Patient introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: patient.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.patient.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

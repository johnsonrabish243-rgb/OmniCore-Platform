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
  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments, total: appointments.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, patientId, patientName, doctor, date, time, type, status, notes } = body;
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const appointment = await prisma.appointment.create({
    data: {
      organizationId,
      patientId,
      patientName,
      doctor,
      date,
      time,
      type,
      status: status || "scheduled",
      notes,
    },
  });

  return NextResponse.json({ appointment });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: appointment.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.patientName !== undefined && { patientName: data.patientName }),
      ...(data.doctor !== undefined && { doctor: data.doctor }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.time !== undefined && { time: data.time }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.patientId !== undefined && { patientId: data.patientId }),
    },
  });

  return NextResponse.json({ appointment: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: appointment.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

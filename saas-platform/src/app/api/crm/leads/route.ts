import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  const leads = await prisma.lead.findMany({
    where: { organizationId: { in: orgIds } },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = leads.map((lead) => ({
    id: lead.id,
    name: `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    jobTitle: lead.jobTitle,
    source: lead.source,
    status: lead.status,
    score: lead.score,
    notes: lead.notes,
    assignedTo: lead.assignedTo ? `${lead.assignedTo.firstName || ""} ${lead.assignedTo.lastName || ""}`.trim() : null,
    createdBy: lead.createdBy ? `${lead.createdBy.firstName || ""} ${lead.createdBy.lastName || ""}`.trim() : null,
    createdAt: lead.createdAt,
  }));

  return NextResponse.json({ leads: mapped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, firstName, lastName, email, phone, company, jobTitle, source, status, score, notes, assignedToId } = body;

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const lead = await prisma.lead.create({
    data: {
      organizationId,
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      source,
      status: status || "new",
      score: score || 0,
      notes,
      assignedToId: assignedToId || user.id,
      createdById: user.id,
    },
  });

  return NextResponse.json({ lead });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: lead.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.score !== undefined && { score: data.score }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
  });

  return NextResponse.json({ lead: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: lead.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

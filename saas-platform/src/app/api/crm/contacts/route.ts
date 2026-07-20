import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  const contacts = await prisma.contact.findMany({
    where: { organizationId: { in: orgIds } },
    include: {
      _count: { select: { deals: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = contacts.map((c) => ({
    id: c.id,
    name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
    email: c.email,
    phone: c.phone,
    jobTitle: c.jobTitle,
    company: c.company,
    source: c.source,
    notes: c.notes,
    dealsCount: c._count.deals,
    createdBy: c.createdBy ? `${c.createdBy.firstName || ""} ${c.createdBy.lastName || ""}`.trim() : null,
    createdAt: c.createdAt,
  }));

  return NextResponse.json({ contacts: mapped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const moduleCheck = await requireModule("crm");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const body = await request.json();
  const { organizationId, firstName, lastName, email, phone, jobTitle, company, notes, source } = body;

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const contact = await prisma.contact.create({
    data: {
      organizationId,
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      company,
      notes,
      source,
      createdById: user.id,
    },
  });

  return NextResponse.json({ contact });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: contact.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.source !== undefined && { source: data.source }),
    },
  });

  return NextResponse.json({ contact: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: contact.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

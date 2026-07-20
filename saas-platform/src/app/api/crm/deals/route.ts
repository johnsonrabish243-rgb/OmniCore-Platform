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

  const deals = await prisma.deal.findMany({
    where: { organizationId: { in: orgIds } },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = deals.map((deal) => ({
    id: deal.id,
    title: deal.title,
    company: deal.contact?.company || deal.contact ? `${deal.contact.firstName || ""} ${deal.contact.lastName || ""}`.trim() : "Sans contact",
    value: new Intl.NumberFormat("fr-FR", { style: "currency", currency: deal.currency }).format(Number(deal.value)),
    stage: deal.stage,
    probability: deal.probability,
    assignee: deal.assignedTo ? `${deal.assignedTo.firstName || ""} ${deal.assignedTo.lastName || ""}`.trim() : null,
    contactId: deal.contactId,
    currency: deal.currency,
    expectedCloseDate: deal.expectedCloseDate,
    notes: deal.notes,
    source: deal.source,
  }));

  return NextResponse.json({ deals: mapped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, title, value, currency, contactId, probability, expectedCloseDate, notes, source } = body;

  if (!organizationId || !title) {
    return NextResponse.json({ error: "organizationId et title requis" }, { status: 400 });
  }

  // Verify user is member of this organization
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const deal = await prisma.deal.create({
    data: {
      organizationId,
      title,
      value: value || 0,
      currency: currency || "EUR",
      stage: "LEAD",
      probability: probability || 0,
      contactId: contactId || undefined,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      notes,
      source,
      createdById: user.id,
      assignedToId: user.id,
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, company: true } },
    },
  });

  return NextResponse.json({ deal });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, stage, value, probability, contactId, expectedCloseDate, notes, title } = body;

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "Affaire introuvable" }, { status: 404 });

  // Verify access
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: deal.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.deal.update({
    where: { id },
    data: {
      ...(stage && { stage }),
      ...(typeof value === "number" && { value }),
      ...(typeof probability === "number" && { probability }),
      ...(contactId && { contactId }),
      ...(expectedCloseDate && { expectedCloseDate: new Date(expectedCloseDate) }),
      ...(notes !== undefined && { notes }),
      ...(title && { title }),
    },
  });

  return NextResponse.json({ deal: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "Affaire introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: deal.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

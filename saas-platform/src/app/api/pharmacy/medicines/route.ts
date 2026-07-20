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
  const medicines = await prisma.medicine.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ medicines, total: medicines.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const moduleCheck = await requireModule("pharmacy");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const body = await request.json();
  const { organizationId, name, dosage, category, stock, price, expiryDate, supplier } = body;
  if (!organizationId || !name) {
    return NextResponse.json({ error: "organizationId et name requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const medicine = await prisma.medicine.create({
    data: {
      organizationId,
      name,
      dosage,
      category,
      stock: stock || 0,
      price: price || 0,
      expiryDate,
      supplier,
    },
  });

  return NextResponse.json({ medicine });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) return NextResponse.json({ error: "Médicament introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: medicine.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.medicine.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.dosage !== undefined && { dosage: data.dosage }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
      ...(data.supplier !== undefined && { supplier: data.supplier }),
    },
  });

  return NextResponse.json({ medicine: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) return NextResponse.json({ error: "Médicament introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: medicine.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.medicine.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

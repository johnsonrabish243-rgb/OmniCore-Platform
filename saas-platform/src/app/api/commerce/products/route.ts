import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  const orgIds = memberships.map((m) => m.organizationId);

  const where = organizationId ? { organizationId } : { organizationId: { in: orgIds } };
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products, total: products.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { organizationId, name, sku, description, category, price, stock } = body;

  if (!organizationId || !name) {
    return NextResponse.json({ error: "organizationId et name requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const product = await prisma.product.create({
    data: {
      organizationId,
      name,
      sku,
      description,
      category,
      price: price || 0,
      stock: stock || 0,
    },
  });

  return NextResponse.json({ product });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: product.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.sku !== undefined && { sku: data.sku }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: product.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

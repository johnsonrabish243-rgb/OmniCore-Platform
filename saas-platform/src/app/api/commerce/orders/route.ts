import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";

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
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders, total: orders.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const moduleCheck = await requireModule("commerce");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const body = await request.json();
  const { organizationId, customerName, customerEmail, notes, items } = body;

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Generate order number
  const count = await prisma.order.count({ where: { organizationId } });
  const orderNumber = `CMD-${String(count + 1).padStart(6, "0")}`;

  // Calculate total from items
  let total = 0;
  const orderItems = (items || []).map((item: any) => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    total += itemTotal;
    return {
      productId: item.productId || null,
      name: item.name || "Article",
      quantity: item.quantity || 1,
      price: item.price || 0,
    };
  });

  const order = await prisma.order.create({
    data: {
      organizationId,
      orderNumber,
      customerName,
      customerEmail,
      status: "pending",
      total,
      notes,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ order });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: order.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.customerName !== undefined && { customerName: data.customerName }),
      ...(data.customerEmail !== undefined && { customerEmail: data.customerEmail }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.total !== undefined && { total: data.total }),
    },
    include: { items: true },
  });

  return NextResponse.json({ order: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: order.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

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
  const stockMovements = await prisma.stockMovement.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ stockMovements, total: stockMovements.length });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { organizationId, medicineId, type, quantity, user: userName, note } = body;
  if (!organizationId || !quantity) {
    return NextResponse.json({ error: "organizationId et quantity requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Update medicine stock accordingly
  if (medicineId) {
    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (medicine && medicine.organizationId === organizationId) {
      await prisma.medicine.update({
        where: { id: medicineId },
        data: {
          stock: type === "in"
            ? medicine.stock + quantity
            : Math.max(0, medicine.stock - quantity),
        },
      });
    }
  }

  const stockMovement = await prisma.stockMovement.create({
    data: {
      organizationId,
      medicineId,
      type: type || "in",
      quantity,
      user: userName || "Admin",
      note,
    },
  });

  return NextResponse.json({ stockMovement });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const movement = await prisma.stockMovement.findUnique({ where: { id } });
  if (!movement) return NextResponse.json({ error: "Mouvement introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: movement.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.stockMovement.update({
    where: { id },
    data: {
      ...(data.type !== undefined && { type: data.type }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.medicineId !== undefined && { medicineId: data.medicineId }),
    },
  });

  return NextResponse.json({ stockMovement: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const movement = await prisma.stockMovement.findUnique({ where: { id } });
  if (!movement) return NextResponse.json({ error: "Mouvement introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: movement.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Reverse stock change if medicine is linked
  if (movement.medicineId) {
    const medicine = await prisma.medicine.findUnique({ where: { id: movement.medicineId } });
    if (medicine) {
      await prisma.medicine.update({
        where: { id: movement.medicineId },
        data: {
          stock: movement.type === "in"
            ? Math.max(0, medicine.stock - movement.quantity)
            : medicine.stock + movement.quantity,
        },
      });
    }
  }

  await prisma.stockMovement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

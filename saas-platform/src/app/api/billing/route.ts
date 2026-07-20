import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  const billing = await prisma.billing.findMany({
    where: { organizationId: { in: orgIds } },
    include: { invoices: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  return NextResponse.json({ billing });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { organizationId, tier } = body;

  if (!organizationId || !tier) {
    return NextResponse.json({ error: "organizationId et tier requis" }, { status: 400 });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: user.id, isOwner: true },
  });

  if (!membership && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const existing = await prisma.billing.findUnique({
    where: { organizationId },
  });

  if (existing) {
    const updated = await prisma.billing.update({
      where: { organizationId },
      data: { tier, status: "ACTIVE" },
      include: { invoices: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    return NextResponse.json({ billing: updated });
  }

  const billing = await prisma.billing.create({
    data: {
      organizationId,
      tier,
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    include: { invoices: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  return NextResponse.json({ billing });
}

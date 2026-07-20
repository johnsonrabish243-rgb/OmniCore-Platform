import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const url = new URL(request.url);
  const showDeliveries = url.searchParams.get("deliveries") === "true";

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  const orgIds = memberships.map((m) => m.organizationId);

  const webhooks = await prisma.webhook.findMany({
    where: { organizationId: { in: orgIds } },
    include: showDeliveries
      ? { deliveries: { orderBy: { createdAt: "desc" }, take: 20 } }
      : { _count: { select: { deliveries: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ webhooks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { organizationId, name, url, events, secret } = body;

  if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "name, url et events requis" }, { status: 400 });
  }

  // Validate URL
  try { new URL(url); } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  // Auto-detect org from user's memberships
  let orgId = organizationId;
  if (!orgId) {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    if (!membership) return NextResponse.json({ error: "Aucune organisation trouvée" }, { status: 400 });
    orgId = membership.organizationId;
  } else {
    const membership = await prisma.organizationMember.findFirst({
      where: { organizationId: orgId, userId: user.id },
    });
    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const webhook = await prisma.webhook.create({
    data: { organizationId, name, url, events, secret },
  });

  return NextResponse.json({ webhook });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id, name, url, events, secret, isActive } = body;

  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook) return NextResponse.json({ error: "Webhook introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: webhook.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.webhook.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url }),
      ...(events !== undefined && { events }),
      ...(secret !== undefined && { secret }),
      ...(typeof isActive === "boolean" && { isActive }),
    },
  });

  return NextResponse.json({ webhook: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook) return NextResponse.json({ error: "Webhook introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: webhook.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.webhook.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

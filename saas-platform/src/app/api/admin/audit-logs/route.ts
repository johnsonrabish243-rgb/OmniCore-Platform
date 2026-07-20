import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { action, entity, entityId, description, metadata } = body;

  if (!action) return NextResponse.json({ error: "action requis" }, { status: 400 });

  const log = await prisma.auditLog.create({
    data: {
      userId: user.id,
      action,
      entity,
      entityId,
      description,
      metadata: metadata || undefined,
    },
  });

  return NextResponse.json({ log });
}

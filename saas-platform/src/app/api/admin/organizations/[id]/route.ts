import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.organization.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
      ...(body.tier && { tier: body.tier }),
    },
  });
  return NextResponse.json({ organization: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.organization.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const { firstName, lastName, jobTitle, department } = body;

  // Verify caller belongs to same organization
  const memberships = await prisma.organizationMember.findMany({ where: { userId: user.id }, select: { organizationId: true } });
  const orgIds = memberships.map((m) => m.organizationId);
  const member = await prisma.organizationMember.findFirst({ where: { userId: id, organizationId: { in: orgIds } } });
  if (!member) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const updated = await prisma.user.update({ where: { id }, data: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(jobTitle && { jobTitle }), ...(department && { department }) }, select: { id: true, email: true, firstName: true, lastName: true, jobTitle: true, department: true } });

  return NextResponse.json({ employee: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  // Verify caller belongs to same organization
  const memberships = await prisma.organizationMember.findMany({ where: { userId: user.id }, select: { organizationId: true } });
  const orgIds = memberships.map((m) => m.organizationId);
  const member = await prisma.organizationMember.findFirst({ where: { userId: id, organizationId: { in: orgIds } } });
  if (!member) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Remove membership
  await prisma.organizationMember.deleteMany({ where: { userId: id, organizationId: { in: orgIds } } });

  return NextResponse.json({ success: true });
}

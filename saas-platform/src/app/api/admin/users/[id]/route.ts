import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/auth-helpers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return await prisma.user.findUnique({ where: { id: payload.userId as string } });
  } catch (error) { console.error("Admin [id] getCurrentUser error:", error); return null; }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role && { role: body.role }),
      ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
      ...(body.firstName && { firstName: body.firstName }),
      ...(body.lastName && { lastName: body.lastName }),
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

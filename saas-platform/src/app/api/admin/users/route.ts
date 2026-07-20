import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { hash } from "bcryptjs";
import { getJwtSecret } from "@/lib/auth-helpers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return await prisma.user.findUnique({ where: { id: payload.userId as string } });
  } catch (error) { console.error("Admin getCurrentUser error:", error); return null; }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, avatarUrl: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const body = await request.json();
  const { email, password, firstName, lastName, role } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

  const passwordHash = await hash(password, 12);
  const newUser = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: role || "EMPLOYEE", language: "fr", timezone: "Europe/Paris" },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  return NextResponse.json({ user: newUser });
}

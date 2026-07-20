import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        phone: true,
        avatarUrl: true,
        role: true,
        language: true,
        timezone: true,
        country: true,
        createdAt: true,
        lastLoginAt: true,
        jobTitle: true,
        department: true,
        onlineStatus: true,
      },
    });

    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

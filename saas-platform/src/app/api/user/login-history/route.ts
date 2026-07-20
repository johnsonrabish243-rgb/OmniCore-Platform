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
    const history = await prisma.loginHistory.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Login history fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

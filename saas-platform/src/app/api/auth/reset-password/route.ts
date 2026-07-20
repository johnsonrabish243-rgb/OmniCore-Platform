import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { hash } from "bcryptjs";
import { getResetJwtSecret } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    const { payload } = await jwtVerify(token, getResetJwtSecret());
    if (payload.type !== "reset") {
      return NextResponse.json({ error: "Token invalide" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Reset password token verification failed:", error);
    return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
  }
}

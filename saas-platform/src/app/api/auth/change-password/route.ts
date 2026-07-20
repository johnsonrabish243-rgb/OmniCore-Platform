import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { getJwtSecret } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }

    const isValid = await compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    const passwordHash = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Erreur lors du changement de mot de passe" }, { status: 500 });
  }
}

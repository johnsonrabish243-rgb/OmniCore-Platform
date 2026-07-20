import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getJwtSecret } from "@/lib/auth-helpers";

function generateApiKey(): string {
  return `oc_${randomBytes(32).toString("hex")}`;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: payload.userId as string },
      select: { id: true, name: true, key: true, permissions: true, lastUsedAt: true, expiresAt: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    // Mask keys for security
    const masked = apiKeys.map((k) => ({
      ...k,
      key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
    }));

    return NextResponse.json({ apiKeys: masked });
  } catch (error) {
    console.error("API keys fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const body = await request.json();
    const { name, permissions, expiresAt } = body;

    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: payload.userId as string,
        name,
        key: generateApiKey(),
        permissions: permissions || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
      },
    });
  } catch (error) {
    console.error("API keys POST error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const body = await request.json();
    const { keyId } = body;

    if (!keyId) return NextResponse.json({ error: "keyId requis" }, { status: 400 });

    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: payload.userId as string },
    });
    if (!apiKey) return NextResponse.json({ error: "Clé API introuvable" }, { status: 404 });

    await prisma.apiKey.delete({ where: { id: keyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API keys DELETE error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

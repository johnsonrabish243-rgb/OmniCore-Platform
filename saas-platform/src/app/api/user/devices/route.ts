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
    const devices = await prisma.device.findMany({
      where: { userId: payload.userId as string },
      orderBy: { lastUsedAt: "desc" },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Devices fetch error:", error);
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

    const device = await prisma.device.create({
      data: {
        userId: payload.userId as string,
        name: body.name,
        type: body.type,
        browser: body.browser,
        os: body.os,
        ipAddress: body.ipAddress,
      },
    });

    return NextResponse.json({ device });
  } catch (error) {
    console.error("Devices POST error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { payload } = await jwtVerify(token, getJwtSecret());
    const body = await request.json();
    const { deviceId, isTrusted } = body;

    if (!deviceId) return NextResponse.json({ error: "deviceId requis" }, { status: 400 });

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId: payload.userId as string },
    });
    if (!device) return NextResponse.json({ error: "Appareil introuvable" }, { status: 404 });

    const updated = await prisma.device.update({
      where: { id: deviceId },
      data: {
        ...(typeof isTrusted === "boolean" && { isTrusted }),
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ device: updated });
  } catch (error) {
    console.error("Devices PATCH error:", error);
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
    const { deviceId } = body;

    if (!deviceId) return NextResponse.json({ error: "deviceId requis" }, { status: 400 });

    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId: payload.userId as string },
    });
    if (!device) return NextResponse.json({ error: "Appareil introuvable" }, { status: 404 });

    await prisma.device.delete({ where: { id: deviceId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Devices DELETE error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

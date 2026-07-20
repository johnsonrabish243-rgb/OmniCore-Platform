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
    const notifications = await prisma.notification.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: payload.userId as string, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications fetch error:", error);
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
    const { notificationId, readAll } = body;

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId: payload.userId as string, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (!notificationId) return NextResponse.json({ error: "notificationId requis" }, { status: 400 });

    await prisma.notification.updateMany({
      where: { id: notificationId, userId: payload.userId as string },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
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
    const { notificationId, clearAll } = body;

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId: payload.userId as string },
      });
      return NextResponse.json({ success: true });
    }

    if (!notificationId) return NextResponse.json({ error: "notificationId requis" }, { status: 400 });

    await prisma.notification.deleteMany({
      where: { id: notificationId, userId: payload.userId as string },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications DELETE error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

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
  } catch (error) { console.error("Admin orgs getCurrentUser error:", error); return null; }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const organizations = await prisma.organization.findMany({
    include: { _count: { select: { members: true } }, billing: true },
    orderBy: { createdAt: "desc" },
  });
  const mapped = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    members: org._count.members,
    plan: org.billing?.tier || "FREE",
    status: org.isActive ? "active" : "suspended",
    createdAt: org.createdAt,
  }));
  return NextResponse.json({ organizations: mapped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  const body = await request.json();
  const { name } = body;
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const org = await prisma.organization.create({
    data: { name, slug: slug || `org-${Date.now()}` },
  });
  return NextResponse.json({ organization: org });
}

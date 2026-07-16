import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Get members of organizations the user belongs to
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  const employees = await prisma.organizationMember.findMany({
    where: { organizationId: { in: orgIds } },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true, department: true },
      },
    },
  });

  const mapped = employees.map((emp) => ({
    id: emp.user.id,
    name: `${emp.user.firstName || ""} ${emp.user.lastName || ""}`.trim(),
    email: emp.user.email,
    role: emp.user.jobTitle,
    department: emp.user.department || "Non spécifié",
    status: "active",
  }));

  return NextResponse.json({ employees: mapped });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { email, firstName, lastName, jobTitle, department } = body;
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  // Find the caller's organization (first one)
  const memberships = await prisma.organizationMember.findMany({ where: { userId: user.id }, select: { organizationId: true } });
  const orgId = memberships[0]?.organizationId;
  if (!orgId) return NextResponse.json({ error: "L'utilisateur n'appartient à aucune organisation" }, { status: 403 });

  // Create user (if not exists) and organization member
  let createdUser = await prisma.user.findUnique({ where: { email } });
  if (!createdUser) {
    createdUser = await prisma.user.create({ data: { email, firstName, lastName, jobTitle, department, role: "EMPLOYEE", language: "fr", timezone: "UTC" } });
  }

  // Create membership if missing
  const existingMember = await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: orgId, userId: createdUser.id } } }).catch(() => null);
  if (!existingMember) {
    await prisma.organizationMember.create({ data: { organizationId: orgId, userId: createdUser.id, role: "EMPLOYEE" } });
  }

  const mapped = { id: createdUser.id, name: `${createdUser.firstName || ""} ${createdUser.lastName || ""}`.trim(), email: createdUser.email, role: createdUser.jobTitle, department: createdUser.department || "Non spécifié", status: "active" };
  return NextResponse.json({ employee: mapped });
}

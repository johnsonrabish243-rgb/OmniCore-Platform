import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser, getResetJwtSecret } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";
import { SignJWT } from "jose";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const url = new URL(request.url);
  const pageParam = parseInt(url.searchParams.get("page") || "1", 10);
  const limitParam = parseInt(url.searchParams.get("limit") || "20", 10);
  const page = Math.max(1, pageParam);
  const limit = Math.min(Math.max(1, limitParam), 100);
  const organizationId = url.searchParams.get("organizationId");

  // Get members of organizations the user belongs to
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  const orgIds = memberships.map((m) => m.organizationId);

  const whereClause = organizationId ? { organizationId } : { organizationId: { in: orgIds } };

  const total = await prisma.organizationMember.count({ where: whereClause });
  const members = await prisma.organizationMember.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true, department: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const mapped = members.map((emp) => ({
    id: emp.user.id,
    name: `${emp.user.firstName || ""} ${emp.user.lastName || ""}`.trim(),
    email: emp.user.email,
    role: emp.user.jobTitle,
    department: emp.user.department || "Non spécifié",
    status: "active",
  }));

  return NextResponse.json({ employees: mapped, total, page, limit });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Module enforcement: HR must be enabled
  const moduleCheck = await requireModule("hr");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  // Only SUPER_ADMIN, ADMIN, and OWNER can create accounts
  if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(user.role)) {
    return NextResponse.json({ error: "Seuls les administrateurs peuvent créer des comptes" }, { status: 403 });
  }

  const body = await request.json();
  const { email, firstName, lastName, jobTitle, department, organizationId } = body;
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  // Determine organization: use provided organizationId if caller is member, otherwise fallback to first org
  const memberships = await prisma.organizationMember.findMany({ where: { userId: user.id }, select: { organizationId: true } });
  const orgIds = memberships.map((m) => m.organizationId);
  let orgId = organizationId && orgIds.includes(organizationId) ? organizationId : orgIds[0];
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

  // Generate invitation/reset token so user can set password (valid 24h)
  // Uses separate reset secret so this token can never be used as a session token
  const resetToken = await new SignJWT({ userId: createdUser.id, type: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(getResetJwtSecret());

  // In production, an email should be sent to the user with the resetToken link.
  // The token is NEVER returned in the API response — only logged server-side.
  console.log(`[INVITE] User ${createdUser.email} (${createdUser.id}) invited with reset token (dev only log)`);

  const mapped = { id: createdUser.id, name: `${createdUser.firstName || ""} ${createdUser.lastName || ""}`.trim(), email: createdUser.email, role: createdUser.jobTitle, department: createdUser.department || "Non spécifié", status: "active" };
  return NextResponse.json({ employee: mapped, invite: { message: "Invitation email would be sent in production" } });
}

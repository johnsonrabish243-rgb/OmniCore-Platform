import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser, getActiveWorkspace } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const activeWs = await getActiveWorkspace();
  if (!activeWs) return NextResponse.json({ error: "Aucun espace de travail actif" }, { status: 404 });

  // Verify user is member of the workspace's organization
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: activeWs.organizationId, userId: user.id },
  });
  if (!membership && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const orgId = activeWs.organizationId;

  try {
    const [employees, departments, recentMembers, org] = await Promise.all([
      prisma.organizationMember.count({ where: { organizationId: orgId } }),
      prisma.organizationMember.groupBy({
        by: ["role"],
        where: { organizationId: orgId },
        _count: true,
      }),
      prisma.organizationMember.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, jobTitle: true, department: true } },
        },
      }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, name: true, slug: true, tier: true, industry: true, createdAt: true },
      }),
    ]);

    const moduleCounts = await Promise.all([
      prisma.medicine.count({ where: { organizationId: orgId } }).catch(() => 0),
      prisma.patient.count({ where: { organizationId: orgId } }).catch(() => 0),
      prisma.student.count({ where: { organizationId: orgId } }).catch(() => 0),
      prisma.product.count({ where: { organizationId: orgId } }).catch(() => 0),
      prisma.order.count({ where: { organizationId: orgId } }).catch(() => 0),
    ]);

    return NextResponse.json({
      workspace: activeWs,
      organization: org,
      stats: {
        employees,
        departments: departments.length,
        modules: {
          medicines: moduleCounts[0],
          patients: moduleCounts[1],
          students: moduleCounts[2],
          products: moduleCounts[3],
          orders: moduleCounts[4],
        },
      },
      recentMembers: recentMembers.map((m) => ({
        id: m.user.id,
        name: `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim(),
        email: m.user.email,
        role: m.role,
        jobTitle: m.user.jobTitle,
        department: m.user.department,
      })),
    });
  } catch (error) {
    console.error("Workspace stats error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

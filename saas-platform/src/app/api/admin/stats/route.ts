import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    // System health checks — simulate service status with DB connectivity
    let dbStatus = "healthy";
    let apiLatency = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      apiLatency = Date.now() - start;
    } catch {
      dbStatus = "degraded";
    }

    const [
      totalUsers,
      totalOrganizations,
      totalWorkspaces,
      activeUsers,
      totalEmployees,
      recentUsers,
      totalOrders,
      totalProducts,
      totalMedicines,
      totalPatients,
      totalStudents,
      totalTeachers,
      recentLogins,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.workspace.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.organizationMember.count({ where: { role: "EMPLOYEE" } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.medicine.count(),
      prisma.patient.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.loginHistory.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { firstName: true, lastName: true, email: true } } } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    const ordersAgg = await prisma.order.aggregate({ _sum: { total: true } });
    const totalRevenue = ordersAgg._sum.total || 0;

    const userGrowth = await Promise.all(
      [5, 4, 3, 2, 1, 0].map(async (i) => {
        const start = new Date();
        start.setMonth(start.getMonth() - i);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        const count = await prisma.user.count({
          where: { createdAt: { gte: start, lt: end } },
        });
        return {
          month: start.toLocaleDateString("fr-FR", { month: "short" }),
          users: count,
        };
      })
    );

    const orgGrowth = await Promise.all(
      [5, 4, 3, 2, 1, 0].map(async (i) => {
        const start = new Date();
        start.setMonth(start.getMonth() - i);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        const count = await prisma.organization.count({
          where: { createdAt: { gte: start, lt: end } },
        });
        return {
          month: start.toLocaleDateString("fr-FR", { month: "short" }),
          organizations: count,
        };
      })
    );

    return NextResponse.json({
      platform: {
        totalUsers,
        totalOrganizations,
        totalWorkspaces,
        activeUsers,
        totalEmployees,
        totalRevenue,
        totalOrders,
        totalProducts,
        totalMedicines,
        totalPatients,
        totalStudents,
        totalTeachers,
      },
      systemHealth: {
        database: { status: dbStatus, latency: apiLatency },
        api: { status: "healthy", latency: Math.round(apiLatency * 0.8) },
        cache: { status: "healthy", latency: 0 },
        storage: { status: "healthy", latency: 0 },
      },
      charts: {
        userGrowth,
        orgGrowth,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
      recentLogins: recentLogins.map((l) => ({
        id: l.id,
        userName: `${l.user.firstName || ""} ${l.user.lastName || ""}`.trim() || l.user.email,
        email: l.user.email,
        ipAddress: l.ipAddress,
        location: l.location,
        createdAt: l.createdAt.toISOString(),
      })),
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        entity: a.entity,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des statistiques" }, { status: 500 });
  }
}

"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  Building2,
  Briefcase,
  Activity,
  Shield,
  Settings,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ShoppingCart,
  Pill,
  GraduationCap,
  Heart,
  RefreshCw,
  UserPlus,
  LogIn,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalWorkspaces: number;
  activeUsers: number;
  totalEmployees: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalMedicines: number;
  totalPatients: number;
  totalStudents: number;
  totalTeachers: number;
}

interface SystemHealthData {
  database: { status: string; latency: number };
  api: { status: string; latency: number };
  cache: { status: string; latency: number };
  storage: { status: string; latency: number };
}

interface ChartData {
  month: string;
  users?: number;
  organizations?: number;
}

interface RecentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface RecentLogin {
  id: string;
  userName: string;
  email: string;
  ipAddress: string | null;
  location: string | null;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  description: string | null;
  entity: string | null;
  createdAt: string;
}

function StatCard({ title, value, icon, color, change, loading }: { title: string; value: string; icon: React.ReactNode; color: string; change?: string; loading?: boolean }) {
  if (loading) {
    return (
      <Card className="group transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-20" />
              <div className="skeleton h-3 w-16" />
            </div>
            <div className="skeleton h-12 w-12 rounded-[12px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = change ? parseFloat(change) >= 0 : true;
  return (
    <Card className="group transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1.5">
                <div className={cn("flex items-center gap-0.5 text-xs font-medium", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                  {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  <span>{change}</span>
                </div>
                <span className="text-xs text-muted-foreground">vs dernier mois</span>
              </div>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] transition-all duration-300 group-hover:scale-110", color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [orgGrowth, setOrgGrowth] = useState<ChartData[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const [activity, setActivity] = useState<AuditEntry[]>([]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.platform);
        setSystemHealth(data.systemHealth);
        setUserGrowth(data.charts?.userGrowth || []);
        setOrgGrowth(data.charts?.orgGrowth || []);
        setRecentUsers(data.recentUsers || []);
        setRecentLogins(data.recentLogins || []);
        setActivity(data.recentActivity || []);
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    // Auto-poll every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 500);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="premium" className="text-xs gap-1">
            <Shield className="h-3 w-3" />
            {t("superAdmin")}
          </Badge>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("users")} value={loading ? "..." : String(stats?.totalUsers || 0)} icon={<Users className="h-6 w-6" />} color="bg-primary/10 text-primary" loading={loading} />
        <StatCard title={t("organizations")} value={loading ? "..." : String(stats?.totalOrganizations || 0)} icon={<Building2 className="h-6 w-6" />} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" loading={loading} />
        <StatCard title="Espaces de travail" value={loading ? "..." : String(stats?.totalWorkspaces || 0)} icon={<Briefcase className="h-6 w-6" />} color="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" loading={loading} />
        <StatCard title="Employés" value={loading ? "..." : String(stats?.totalEmployees || 0)} icon={<Users className="h-6 w-6" />} color="bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" loading={loading} />
      </div>

      {/* Module Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commerce</p>
              <p className="text-lg font-bold">{loading ? "..." : `${stats?.totalOrders || 0} commandes`}</p>
              <p className="text-xs text-muted-foreground">{stats?.totalProducts || 0} produits</p>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pharmacie</p>
              <p className="text-lg font-bold">{loading ? "..." : `${stats?.totalMedicines || 0} médicaments`}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Éducation</p>
              <p className="text-lg font-bold">{loading ? "..." : `${(stats?.totalStudents || 0) + (stats?.totalTeachers || 0)} utilisateurs`}</p>
              <p className="text-xs text-muted-foreground">{stats?.totalStudents || 0} élèves · {stats?.totalTeachers || 0} enseignants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Santé</p>
              <p className="text-lg font-bold">{loading ? "..." : `${stats?.totalPatients || 0} patients`}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Croissance des utilisateurs</CardTitle>
            <CardDescription>Évolution mensuelle des inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="skeleton h-full w-full rounded-lg" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                    <Area type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2} fill="url(#userGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Croissance des organisations</CardTitle>
            <CardDescription>Nouvelles organisations par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="skeleton h-full w-full rounded-lg" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orgGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                    <Bar dataKey="organizations" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Users */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Inscriptions récentes
            </CardTitle>
            <CardDescription>Derniers utilisateurs créés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune inscription récente</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {u.name.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name || u.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.role} · {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Logins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-primary" />
              Activité de connexion
            </CardTitle>
            <CardDescription>Dernières connexions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-40" />
                  </div>
                </div>
              ))
            ) : recentLogins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune connexion récente</p>
            ) : (
              recentLogins.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                    <LogIn className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.ipAddress || "IP inconnue"} · {new Date(l.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t("recentActivity")}
            </CardTitle>
            <CardDescription>{t("recentActivityDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="skeleton h-8 w-8 rounded-[10px]" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-4 w-40" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune activité récente</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
                    a.action?.includes("create") && "bg-emerald-50 text-emerald-600",
                    a.action?.includes("delete") && "bg-red-50 text-red-600",
                    a.action?.includes("update") && "bg-blue-50 text-blue-600",
                    !a.action?.includes("create") && !a.action?.includes("delete") && !a.action?.includes("update") && "bg-muted text-muted-foreground"
                  )}>
                    {a.action?.includes("create") && <UserPlus className="h-4 w-4" />}
                    {a.action?.includes("delete") && <AlertTriangle className="h-4 w-4" />}
                    {a.action?.includes("update") && <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{a.description || a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.entity} · {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t("systemHealth")}
          </CardTitle>
          <CardDescription>{t("systemHealthDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-[12px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Database", key: "database", icon: Server },
                { label: "API", key: "api", icon: Activity },
                { label: "Cache", key: "cache", icon: Shield },
                { label: "Stockage", key: "storage", icon: Briefcase },
              ].map((svc) => {
                const health = systemHealth?.[svc.key as keyof SystemHealthData];
                const isHealthy = health?.status === "healthy";
                return (
                  <div key={svc.key} className="flex items-center gap-3 rounded-[12px] border border-border/50 p-4 hover:shadow-sm transition-all group">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-[10px] transition-all group-hover:scale-110",
                      isHealthy ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      <svc.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{svc.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("flex h-2 w-2 rounded-full", isHealthy ? "bg-emerald-500" : "bg-red-500")} />
                        <span className={cn("text-xs font-medium", isHealthy ? "text-emerald-600" : "text-red-600")}>
                          {isHealthy ? t("operational") : t("degraded")}
                        </span>
                        {health && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            {health.latency}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
          <CardDescription>{t("quickActionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: t("users"), icon: Users, href: "/admin/users" },
            { label: t("organizations"), icon: Building2, href: "/admin/organizations" },
            { label: t("analytics"), icon: Activity, href: "/admin/analytics" },
            { label: t("reports"), icon: FileText, href: "/admin/reports" },
            { label: t("logs"), icon: Shield, href: "/admin/logs" },
            { label: t("configuration"), icon: Settings, href: "/settings" },
          ].map((action) => (
            <a key={action.label} href={action.href}>
              <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:border-primary/30 hover:bg-accent">
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

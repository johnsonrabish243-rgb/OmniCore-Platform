"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getBrandColor } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ChartDataPoint {
  month: string;
  users?: number;
  newUsers?: number;
  free?: number;
  starter?: number;
  professional?: number;
  enterprise?: number;
}

interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalWorkspaces: number;
  activeUsers: number;
  totalEmployees: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
}

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.platform);
          setUserGrowth(data.charts?.userGrowth || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const totalUsers = stats?.totalUsers || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-64 mb-2" />
            <div className="skeleton h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="skeleton h-16 w-full rounded-lg" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardContent className="p-6"><div className="skeleton h-[300px] w-full rounded-lg" /></CardContent></Card>
          <Card><CardContent className="p-6"><div className="skeleton h-[300px] w-full rounded-lg" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("analyticsTitle")}</h1>
          <p className="text-muted-foreground">{t("analyticsSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t("last6Months")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("users"), value: totalUsers.toLocaleString(), change: null, icon: Users, color: "text-primary" },
          { label: t("totalRevenue"), value: `${(totalRevenue / 1000).toFixed(0)}K €`, change: null, icon: DollarSign, color: "text-emerald-500" },
          { label: t("growthRate"), value: `${stats?.activeUsers || 0}`, change: null, icon: TrendingUp, color: "text-amber-500" },
          { label: t("avgUsersPerDay"), value: String(userGrowth.reduce((s, m) => s + (m.users || 0), 0)), change: null, icon: Activity, color: "text-purple-500" },
        ].map((stat) => (
          <Card key={stat.label} className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 group-hover:scale-110 transition-all", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>{t("userGrowth")}</CardTitle>
            <CardDescription>{t("userGrowthDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {userGrowth.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Données insuffisantes</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <defs>
                      <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                    <Area type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2} fill="url(#userGrowthGrad)" />
                    <Area type="monotone" dataKey="newUsers" stroke="#60A5FA" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{t("revenueByPlan")}</CardTitle>
            <CardDescription>{t("revenueByPlanDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Données de revenus par plan disponibles via l&apos;administration des abonnements
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t("planDistribution")}</CardTitle>
            <CardDescription>{t("planDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="h-[180px] w-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Statistiques disponibles après abonnements
              </div>
            </div>
            <div className="space-y-2">
              {[
                { name: "Free", count: stats?.totalOrganizations || 0 },
                { name: "Starter", count: 0 },
                { name: "Professional", count: 0 },
                { name: "Enterprise", count: 0 },
              ].map((plan, i) => (
                <div key={plan.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getBrandColor(i) }} />
                    <span className="text-muted-foreground">{plan.name}</span>
                  </div>
                  <span className="font-medium">{plan.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("keyMetrics")}</CardTitle>
            <CardDescription>{t("keyMetricsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { label: t("users"), value: String(stats?.totalUsers || 0) },
              { label: t("organizations"), value: String(stats?.totalOrganizations || 0) },
              { label: "Espaces de travail", value: String(stats?.totalWorkspaces || 0) },
              { label: "Employés", value: String(stats?.totalEmployees || 0) },
              { label: "Commandes", value: String(stats?.totalOrders || 0) },
              { label: "Produits", value: String(stats?.totalProducts || 0) },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between py-2 px-3 rounded-[10px] border border-border/30">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-sm font-semibold">{metric.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

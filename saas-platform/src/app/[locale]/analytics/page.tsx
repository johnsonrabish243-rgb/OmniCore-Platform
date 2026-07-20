"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, Users, Eye, MousePointerClick, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn, getBrandColor } from "@/lib/utils";

const pageViews = [
  { day: "Lun", views: 4200, unique: 2100 },
  { day: "Mar", views: 3800, unique: 1800 },
  { day: "Mer", views: 5100, unique: 2400 },
  { day: "Jeu", views: 4600, unique: 2200 },
  { day: "Ven", views: 5300, unique: 2600 },
  { day: "Sam", views: 2900, unique: 1400 },
  { day: "Dim", views: 3400, unique: 1700 },
];

const conversionData = [
  { month: "Jan", rate: 3.2 },
  { month: "Fév", rate: 3.5 },
  { month: "Mar", rate: 3.8 },
  { month: "Avr", rate: 4.1 },
  { month: "Mai", rate: 3.9 },
  { month: "Juin", rate: 4.3 },
];

const trafficSources = [
  { name: "Direct", value: 35 },
  { name: "Organique", value: 28 },
  { name: "Social", value: 20 },
  { name: "Email", value: 12 },
  { name: "Référencement", value: 5 },
];

export default function AnalyticsPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("analyticsTitle")}</h1>
          <p className="text-muted-foreground">{t("analyticsDescription")}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pages vues", value: "29 300", change: "+12.5%", icon: Eye, color: "text-primary" },
          { label: "Visiteurs uniques", value: "14 200", change: "+8.3%", icon: Users, color: "text-emerald-500" },
          { label: "Taux conversion", value: "4.3%", change: "+0.5%", icon: TrendingUp, color: "text-amber-500" },
          { label: "Clics", value: "8 450", change: "+15.2%", icon: MousePointerClick, color: "text-purple-500" },
        ].map((stat) => (
          <Card key={stat.label} className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </p>
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
        <Card>
          <CardHeader>
            <CardTitle>Pages vues</CardTitle>
            <CardDescription>7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pageViews}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={2} fill="url(#viewsGrad)" />
                  <Area type="monotone" dataKey="unique" stroke="#60A5FA" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux de conversion</CardTitle>
            <CardDescription>Évolution mensuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
            <CardDescription>Répartition par canal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {trafficSources.map((_, i) => (
                        <Cell key={i} fill={getBrandColor(i)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {trafficSources.map((src, i) => (
                  <div key={src.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getBrandColor(i) }} />
                    <span className="text-muted-foreground">{src.name}</span>
                    <span className="ml-auto font-medium">{src.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs clés</CardTitle>
            <CardDescription>Performances générales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Temps moyen session", value: "4 min 32 s", change: "+8%" },
              { label: "Pages par session", value: "3.8", change: "+5%" },
              { label: "Taux de rebond", value: "32.1%", change: "-2%" },
              { label: "Nouveaux vs Retours", value: "45% / 55%", change: "+3%" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50 hover:bg-muted/50 transition-colors">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{metric.value}</span>
                  <Badge variant="success" className="text-[10px]">{metric.change}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

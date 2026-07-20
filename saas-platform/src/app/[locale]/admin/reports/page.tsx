"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Plus,
  Search,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Rapport financier mensuel",
    type: "financial",
    period: "Juin 2026",
    status: "ready",
    generatedAt: "1 juil. 2026",
    size: "2.4 MB",
    author: "Admin",
  },
  {
    id: 2,
    title: "Rapport d'activité utilisateurs",
    type: "activity",
    period: "Juin 2026",
    status: "ready",
    generatedAt: "1 juil. 2026",
    size: "1.8 MB",
    author: "Admin",
  },
  {
    id: 3,
    title: "Analyse des abonnements Q2",
    type: "subscription",
    period: "Q2 2026",
    status: "ready",
    generatedAt: "30 juin 2026",
    size: "3.1 MB",
    author: "Admin",
  },
  {
    id: 4,
    title: "Rapport de performance système",
    type: "system",
    period: "Juin 2026",
    status: "generating",
    generatedAt: "En cours...",
    size: "-",
    author: "Système",
  },
  {
    id: 5,
    title: "Audit de sécurité",
    type: "security",
    period: "Juin 2026",
    status: "scheduled",
    generatedAt: "5 juil. 2026",
    size: "-",
    author: "Programmé",
  },
  {
    id: 6,
    title: "Rapport de ventes mensuel",
    type: "sales",
    period: "Juin 2026",
    status: "ready",
    generatedAt: "28 juin 2026",
    size: "1.2 MB",
    author: "Admin",
  },
];

const reportTypes: Record<string, { labelKey: string; icon: React.ReactNode; color: string }> = {
  financial: { labelKey: "financial", icon: <DollarSign className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" },
  activity: { labelKey: "activityReport", icon: <Activity className="h-4 w-4" />, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30" },
  subscription: { labelKey: "subscription", icon: <TrendingUp className="h-4 w-4" />, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30" },
  system: { labelKey: "system", icon: <Activity className="h-4 w-4" />, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30" },
  security: { labelKey: "security", icon: <FileText className="h-4 w-4" />, color: "bg-red-50 text-red-600 dark:bg-red-950/30" },
  sales: { labelKey: "sales", icon: <TrendingUp className="h-4 w-4" />, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/30" },
};

export default function AdminReportsPage() {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reportsTitle")}</h1>
          <p className="text-muted-foreground">{t("reportsSubtitle")}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("newReport")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchReport")}
            className="pl-8 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder={t("allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="financial">{t("financial")}</SelectItem>
            <SelectItem value="activity">{t("activity")}</SelectItem>
            <SelectItem value="subscription">{t("subscription")}</SelectItem>
            <SelectItem value="system">{t("system")}</SelectItem>
            <SelectItem value="security">{t("security")}</SelectItem>
            <SelectItem value="sales">{t("sales")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {t("period")}
        </Button>
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((report) => {
          const typeConfig = reportTypes[report.type];
          const statusLabel = report.status === "ready" ? t("ready") : report.status === "generating" ? t("generating") : t("scheduled");
          return (
            <Card key={report.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-[10px]", typeConfig.color)}>
                    {typeConfig.icon}
                  </div>
                  <Badge
                    variant={
                      report.status === "ready" ? "success" :
                      report.status === "generating" ? "warning" : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold mb-1">{report.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {t(typeConfig.labelKey)} · {report.period}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {report.generatedAt}
                  </div>
                  {report.status === "ready" && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reportTypes")}</CardTitle>
          <CardDescription>{t("reportTypesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { titleKey: "financial", descKey: "reportFinancialDesc", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
              { titleKey: "activity", descKey: "reportActivityDesc", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
              { titleKey: "subscription", descKey: "reportSubscriptionDesc", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
              { titleKey: "system", descKey: "reportSystemDesc", icon: Activity, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
              { titleKey: "security", descKey: "reportSecurityDesc", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
              { titleKey: "sales", descKey: "reportSalesDesc", icon: DollarSign, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30" },
            ].map((cat) => (
              <div
                key={cat.titleKey}
                className="flex items-start gap-3 p-4 rounded-[12px] border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]", cat.bg, cat.color)}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t(cat.titleKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(cat.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

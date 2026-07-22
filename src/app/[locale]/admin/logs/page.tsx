"use client";

import { useState, useEffect } from "react";
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
  Search,
  Calendar,
  RefreshCw,
  Shield,
  User,
  Building2,
  CreditCard,
  Settings,
  LogIn,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const actionIcons: Record<string, React.ReactNode> = {
  "organization.created": <Building2 className="h-4 w-4" />,
  "user.login": <LogIn className="h-4 w-4" />,
  "user.suspended": <Shield className="h-4 w-4" />,
  "system.update": <Settings className="h-4 w-4" />,
  "payment.failed": <CreditCard className="h-4 w-4" />,
  "user.role_changed": <User className="h-4 w-4" />,
  "organization.settings": <Settings className="h-4 w-4" />,
  "user.created": <User className="h-4 w-4" />,
  "api.key_generated": <FileText className="h-4 w-4" />,
  "security.alert": <AlertTriangle className="h-4 w-4" />,
  "create": <Building2 className="h-4 w-4" />,
  "update": <User className="h-4 w-4" />,
  "delete": <AlertTriangle className="h-4 w-4" />,
};

const actionLabelKeys: Record<string, string> = {
  "organization.created": "orgCreated",
  "user.login": "login",
  "user.suspended": "accountSuspended",
  "system.update": "systemUpdate",
  "payment.failed": "paymentFailed",
  "user.role_changed": "roleChanged",
  "organization.settings": "settingsChanged",
  "user.created": "userCreated",
  "api.key_generated": "apiKeyGenerated",
  "security.alert": "securityAlert",
};

const severityColors: Record<string, string> = {
  info: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  error: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface AuditEntry {
  id: string;
  action: string;
  description: string | null;
  entity: string | null;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
  ipAddress?: string | null;
}

export default function AdminLogsPage() {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const logsPerPage = 10;

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/audit-logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch = search === "" ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / logsPerPage));
  const paginatedLogs = filtered.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("logsTitle")}</h1>
          <p className="text-muted-foreground">{t("logsSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            {t("refresh")}
          </Button>
          <Badge variant="secondary" className="text-xs">{filtered.length} {t("entries")}</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchLogs")}
            className="pl-8 h-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filtered.length} {t("entries")}
        </Badge>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground w-12"></th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("action")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">{t("details")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("target")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">{t("date")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun log trouvé</td></tr>
                ) : (
                  paginatedLogs.map((log) => {
                    const actionIcon = actionIcons[log.action] || <Shield className="h-4 w-4" />;
                    const severity =
                      log.action?.includes("delete") || log.action?.includes("security") ? "critical" :
                      log.action?.includes("failed") || log.action?.includes("suspended") ? "error" :
                      log.action?.includes("warning") ? "warning" : "info";
                    return (
                      <tr key={log.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className={cn("flex h-8 w-8 items-center justify-center rounded-[8px]", severityColors[severity])}>
                            {actionIcon}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{t(actionLabelKeys[log.action] || log.action) || log.action}</span>
                        </td>
                        <td className="p-4 text-muted-foreground max-w-[250px] truncate hidden lg:table-cell">
                          {log.description || "—"}
                        </td>
                        <td className="p-4 text-muted-foreground max-w-[150px] truncate">{log.entity || "—"}</td>
                        <td className="p-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString("fr-FR") : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("page")} {currentPage} {t("of")} {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
              <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="min-w-[36px]" onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Plus,
  Search,
  Mail,
  Building2,
  User,
  Star,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ───── Types ───── */
interface DealData {
  id: string;
  title: string;
  company: string;
  value: string;
  stage: string;
  probability: number;
  assignee: string | null;
  contactId: string | null;
}

interface ContactData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  company: string | null;
  source: string | null;
  dealsCount: number;
  createdAt: string;
}

interface LeadData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: string;
  score: number;
  assignedTo: string | null;
  createdAt: string;
}

/* ───── Stage helpers ───── */
const stageOrder = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];
const stageBadge: Record<string, "secondary" | "info" | "warning" | "success" | "default" | "destructive"> = {
  LEAD: "secondary",
  QUALIFIED: "info",
  PROPOSAL: "warning",
  NEGOTIATION: "default",
  CLOSED_WON: "success",
  CLOSED_LOST: "destructive",
};

/* ───── Lead status helpers ───── */
const leadStatusColors: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  contacted: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  qualified: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  proposal: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  lost: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

/* ─=======================================================──
   DEALS TAB
   ─=======================================================── */
function DealsTab({ t }: { t: (key: string) => string }) {
  const [deals, setDeals] = useState<DealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  useEffect(() => {
    fetch("/api/crm/deals")
      .then((r) => r.json())
      .then((d) => { if (d.deals) setDeals(d.deals); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = deals.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || d.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const pipelineTotal = deals.reduce((sum, d) => {
    const num = parseFloat(d.value.replace(/[^0-9,]/g, "").replace(",", "."));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("pipeline"), value: `${pipelineTotal.toLocaleString("fr-FR")} €`, change: "+12%", icon: TrendingUp, color: "text-primary" },
          { label: t("clients"), value: deals.length.toString(), change: `+${deals.filter((d) => d.stage === "CLOSED_WON").length}`, icon: Users, color: "text-emerald-500" },
          { label: t("target"), value: "200 000 €", change: `${Math.round((pipelineTotal / 200000) * 100)}%`, icon: Target, color: "text-amber-500" },
          { label: t("monthlyRevenue"), value: "28 500 €", change: "+8%", icon: DollarSign, color: "text-purple-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="h-3 w-3" />{stat.change}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/10 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("search")} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder={t("allStages")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStages")}</SelectItem>
            {stageOrder.map((s) => (
              <SelectItem key={s} value={s}>{t(`stage.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />{t("newDeal")}
        </Button>
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t("salesPipeline")}</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t("noDeals")}</div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((deal) => (
                <div key={deal.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{deal.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{deal.company}</span>
                      {deal.assignee && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{deal.assignee}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={stageBadge[deal.stage] || "secondary"} className="text-[10px] shrink-0">
                    {t(`stage.${deal.stage}`)}
                  </Badge>
                  <div className="w-20 bg-muted rounded-full h-2 shrink-0 hidden sm:block">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${deal.probability}%` }} />
                  </div>
                  <span className="text-sm font-semibold shrink-0 w-24 text-right">{deal.value}</span>
                  <Badge variant={deal.probability > 75 ? "success" : deal.probability > 50 ? "info" : "secondary"} className="text-[10px] shrink-0 hidden md:inline-flex">
                    {deal.probability}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─=======================================================──
   CONTACTS TAB
   ─=======================================================── */
function ContactsTab({ t }: { t: (key: string) => string }) {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/crm/contacts")
      .then((r) => r.json())
      .then((d) => { if (d.contacts) setContacts(d.contacts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("search")} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />{t("newContact")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t("noContacts")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("contactName")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">{t("contactEmail")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">{t("contactCompany")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">{t("contactJobTitle")}</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">Affaires</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {c.email || "—"}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{c.company || "—"}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{c.jobTitle || "—"}</td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary" className="text-[10px]">{c.dealsCount}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─=======================================================──
   LEADS TAB
   ─=======================================================── */
function LeadsTab({ t }: { t: (key: string) => string }) {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/crm/leads")
      .then((r) => r.json())
      .then((d) => { if (d.leads) setLeads(d.leads); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("search")} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder={t("allStatuses")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {["new", "contacted", "qualified", "proposal", "converted", "lost"].map((s) => (
              <SelectItem key={s} value={s}>{t(`leadStatusOptions.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />{t("newLead")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t("noLeads")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("leadName")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">{t("leadEmail")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">{t("leadCompany")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">{t("leadSource")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("leadStatus")}</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">{t("leadScore")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 text-xs font-bold dark:bg-amber-950/30">
                            {l.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium">{l.name}</span>
                            {l.assignedTo && (
                              <p className="text-[10px] text-muted-foreground">Assigné à {l.assignedTo}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">
                        {l.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {l.email}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{l.company || "—"}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{l.source || "—"}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className={cn("text-[10px]", leadStatusColors[l.status] || "")}>
                          {t(`leadStatusOptions.${l.status}`)}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className={cn("h-3 w-3", l.score >= 50 ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                          <span className={cn("text-xs font-medium", l.score >= 50 ? "text-amber-600" : "text-muted-foreground")}>
                            {l.score}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─=======================================================──
   MAIN CRM PAGE (TABS)
   ─=======================================================── */
export default function CRMPage() {
  const t = useTranslations("crm");
  const [activeTab, setActiveTab] = useState("deals");

  const tabs = [
    { id: "deals", label: t("deals") },
    { id: "contacts", label: t("contacts") },
    { id: "leads", label: t("leads") },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center px-4 py-2.5 text-sm font-medium rounded-t-[10px] transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground border border-border/50 border-b-background -mb-px shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "deals" && <DealsTab t={t} />}
      {activeTab === "contacts" && <ContactsTab t={t} />}
      {activeTab === "leads" && <LeadsTab t={t} />}
    </div>
  );
}

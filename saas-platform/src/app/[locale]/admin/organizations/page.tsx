"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, MoreHorizontal, Plus, Ban, CheckCircle } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  members: number;
  plan: string;
  status: string;
  createdAt: string;
}

export default function AdminOrganizationsPage() {
  const t = useTranslations("admin");
  const [orgs, setOrgs] = useState<OrgData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchOrgs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.organizations || []);
      } else {
        showToast(t("fetchUsersFailed") || "Failed to load organizations", "error");
      }
    } catch {
      showToast(t("fetchUsersFailed") || "Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrgs(); }, []);

  async function createOrg() {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      if (res.ok) {
        showToast("Organisation créée", "success");
        setShowDialog(false);
        setNewOrgName("");
        fetchOrgs();
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur", "error");
      }
    } catch {
      showToast("Erreur lors de la création", "error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleOrgStatus(org: OrgData) {
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: org.status !== "active" }),
      });
      if (res.ok) {
        showToast(
          org.status === "active" ? "Organisation suspendue" : "Organisation activée",
          "success"
        );
        fetchOrgs();
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur", "error");
      }
    } catch {
      showToast("Erreur", "error");
    }
  }

  const filtered = orgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("organizations")}</h1>
          <p className="text-muted-foreground">
            {loading ? "..." : orgs.length} {t("orgsOnPlatform")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              className="pl-8 w-48 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="gap-2" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4" />
            {t("create")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("allOrganizations")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("organizationName")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("members")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("plan")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("status")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {t("search")}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Aucune organisation trouvée
                    </td>
                  </tr>
                ) : (
                  filtered.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-medium">{org.name}</span>
                            <p className="text-xs text-muted-foreground">{org.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {org.members}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            org.plan === "ENTERPRISE"
                              ? "premium"
                              : org.plan === "PROFESSIONAL"
                              ? "info"
                              : "secondary"
                          }
                        >
                          {org.plan}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={org.status === "active" ? "success" : "destructive"}
                        >
                          {org.status === "active" ? t("active") : t("suspended")}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleOrgStatus(org)}
                          title={
                            org.status === "active" ? "Suspendre" : "Activer"
                          }
                        >
                          {org.status === "active" ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("create")} Organisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("organizationName")}</label>
              <Input
                placeholder="Nom de l'organisation"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              {t("search")}
            </Button>
            <Button onClick={createOrg} loading={creating}>
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

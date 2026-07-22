"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Layers, Building2, MoreHorizontal, Plus, Ban, CheckCircle, Settings2, Save } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ALL_MODULES = [
  { id: "hr", label: "Ressources Humaines" },
  { id: "finance", label: "Finance" },
  { id: "crm", label: "CRM" },
  { id: "commerce", label: "Commerce" },
  { id: "sales", label: "Ventes" },
  { id: "inventory", label: "Inventaire" },
  { id: "pharmacy", label: "Pharmacie" },
  { id: "education", label: "Éducation" },
  { id: "healthcare", label: "Santé" },
  { id: "projects", label: "Projets" },
  { id: "tasks", label: "Tâches" },
  { id: "calendar", label: "Calendrier" },
  { id: "messages", label: "Messages" },
  { id: "documents", label: "Documents" },
];

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  description: string | null;
  type: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminWorkspacesPage() {
  const c = useTranslations("common");
  const t = useTranslations("admin");
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [orgNames, setOrgNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newOrgId, setNewOrgId] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [creating, setCreating] = useState(false);
  const [modulesDialog, setModulesDialog] = useState<{ ws: WorkspaceData; enabled: string[] } | null>(null);
  const [savingModules, setSavingModules] = useState(false);

  async function fetchWorkspaces() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch {
      showToast("Erreur lors du chargement", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkspaces();
    // Fetch orgs for the create dialog
    fetch("/api/admin/organizations")
      .then((r) => r.ok && r.json())
      .then((data) => {
        if (data?.organizations) {
          setOrgs(data.organizations.map((o: any) => ({ id: o.id, name: o.name })));
          const names: Record<string, string> = {};
          data.organizations.forEach((o: any) => { names[o.id] = o.name; });
          setOrgNames(names);
        }
      })
      .catch(() => {});
  }, []);

  async function createWorkspace() {
    if (!newName.trim() || !newSlug.trim() || !newOrgId) {
      showToast("Nom, slug et organisation requis", "warning");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: newOrgId,
          name: newName.trim(),
          slug: newSlug.trim(),
          description: newDescription.trim() || undefined,
        }),
      });
      if (res.ok) {
        showToast("Espace de travail créé", "success");
        setShowDialog(false);
        setNewName("");
        setNewSlug("");
        setNewDescription("");
        fetchWorkspaces();
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

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Espaces de travail
          </h1>
          <p className="text-muted-foreground">
            {loading ? "..." : workspaces.length} espaces de travail
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
            Nouveau
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tous les espaces de travail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Slug</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Organisation</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Chargement...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Aucun espace de travail trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((ws) => (
                    <tr
                      key={ws.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{ws.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">
                        {ws.slug}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          {orgNames[ws.organizationId] || ws.organizationId.slice(0, 8)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {ws.type || "Workspace"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={ws.isActive ? "success" : "destructive"}
                        >
                          {ws.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/workspaces/${ws.id}/modules`);
                              if (res.ok) {
                                const data = await res.json();
                                setModulesDialog({ ws, enabled: data.enabledModules || [] });
                              }
                            } catch {}
                          }}>
                            <Settings2 className="h-3.5 w-3.5" />
                            Modules
                          </Button>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Nouvel espace de travail</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organisation</label>
              <select
                className="flex h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm"
                value={newOrgId}
                onChange={(e) => setNewOrgId(e.target.value)}
              >
                <option value="">Sélectionner une organisation</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                placeholder="Mon espace de travail"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                placeholder="mon-espace-de-travail"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm resize-none h-20"
                placeholder="Description optionnelle"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)}>
              {c("cancel")}
            </Button>
            <Button onClick={createWorkspace} loading={creating}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Toggle Dialog */}
      <Dialog open={!!modulesDialog} onOpenChange={(v) => { if (!v) setModulesDialog(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Modules — {modulesDialog?.ws.name || ""}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              Activez ou désactivez les modules disponibles pour cet espace de travail.
            </p>
            <ScrollArea className="max-h-[320px]">
              <div className="space-y-1">
                {ALL_MODULES.map((mod) => {
                  const enabled = modulesDialog?.enabled.includes(mod.id) ?? false;
                  return (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between rounded-[10px] px-3 py-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <label htmlFor={`mod-${mod.id}`} className="text-sm font-medium cursor-pointer flex-1">
                        {mod.label}
                      </label>
                      <Switch
                        id={`mod-${mod.id}`}
                        checked={enabled}
                        onCheckedChange={(checked) => {
                          if (!modulesDialog) return;
                          setModulesDialog({
                            ...modulesDialog,
                            enabled: checked
                              ? [...modulesDialog.enabled, mod.id]
                              : modulesDialog.enabled.filter((m) => m !== mod.id),
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModulesDialog(null)}>
              Annuler
            </Button>
            <Button onClick={async () => {
              if (!modulesDialog) return;
              setSavingModules(true);
              try {
                const res = await fetch(`/api/admin/workspaces/${modulesDialog.ws.id}/modules`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ enabledModules: modulesDialog.enabled }),
                });
                if (res.ok) {
                  showToast("Modules mis à jour avec succès", "success");
                  setModulesDialog(null);
                } else {
                  const data = await res.json();
                  showToast(data.error || "Erreur", "error");
                }
              } catch {
                showToast("Erreur lors de la mise à jour", "error");
              } finally {
                setSavingModules(false);
              }
            }} loading={savingModules}>
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { showToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  User,
  Shield,
  Palette,
  Bell,
  CreditCard,
  Key,
  Save,
  Moon,
  Sun,
  Monitor,
  Webhook,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ───── Types ───── */
interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  deliveries?: WebhookDeliveryData[];
  _count?: { deliveries: number };
}

interface WebhookDeliveryData {
  id: string;
  event: string;
  url: string;
  status: string;
  statusCode: number | null;
  duration: number | null;
  responseBody: string | null;
  createdAt: string;
}

/* ───── Available events ───── */
const AVAILABLE_EVENTS = [
  "deal.created",
  "deal.updated",
  "contact.created",
  "contact.updated",
  "lead.created",
  "lead.updated",
];

/* ───── Webhook Card ───── */
function WebhookCard({
  wh,
  onEdit,
  onDelete,
  onTest,
  t,
  i,
}: {
  wh: WebhookData;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  t: (key: string) => string;
  i: (key: string) => string;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; statusCode: number; duration: number } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/integrations/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId: wh.id }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, statusCode: data.statusCode, duration: data.duration });
    } catch {
      setTestResult({ success: false, statusCode: 0, duration: 0 });
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[10px]",
              wh.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{wh.name}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[280px]">{wh.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={wh.isActive ? "success" : "secondary"} className="text-[10px]">
              {wh.isActive ? i("webhookActive") : i("webhookInactive")}
            </Badge>
          </div>
        </div>

        {/* Events */}
        <div className="flex flex-wrap gap-1 mb-3">
          {wh.events.map((ev) => (
            <Badge key={ev} variant="secondary" className="text-[9px]">
              {i(`event${ev.split(".").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("")}`) || ev}
            </Badge>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {i("lastTriggered")}: {wh.lastTriggeredAt ? new Date(wh.lastTriggeredAt).toLocaleDateString("fr-FR") : i("never")}
            {" · "}
            {wh._count?.deliveries ?? wh.deliveries?.length ?? 0} envoi(s)
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon-sm" onClick={handleTest} disabled={testing} title={i("testWebhook")}>
              {testing ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onEdit}><ExternalLink className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div className={cn(
            "mt-3 p-2 rounded-[8px] text-xs flex items-center gap-2",
            testResult.success ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-red-50 text-red-700 dark:bg-red-950/30"
          )}>
            {testResult.success ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            <span>{testResult.success ? i("testSuccessful") : i("testFailed")}</span>
            <span className="ml-auto">HTTP {testResult.statusCode} · {testResult.duration}{i("ms")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ───── Webhook Dialog ───── */
function WebhookDialog({
  open,
  onOpenChange,
  webhook,
  onSave,
  t,
  i,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  webhook?: WebhookData | null;
  onSave: (data: { name: string; url: string; events: string[]; secret: string }) => void;
  t: (key: string) => string;
  i: (key: string) => string;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    if (webhook) {
      setName(webhook.name);
      setUrl(webhook.url);
      setSecret(webhook.secret || "");
      setSelectedEvents(webhook.events);
    } else {
      setName("");
      setUrl("");
      setSecret("");
      setSelectedEvents([]);
    }
  }, [webhook, open]);

  const toggleEvent = (ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, url, events: selectedEvents, secret });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{webhook ? i("editWebhook") : i("addWebhook")}</DialogTitle>
          <DialogDescription>{i("webhookDesc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{i("webhookName")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={i("webhookNamePlaceholder")} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{i("webhookUrl")}</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={i("webhookUrlPlaceholder")} required type="url" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{i("webhookSecret")}</label>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={i("webhookSecretPlaceholder")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{i("webhookEvents")}</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_EVENTS.map((ev) => {
                const labelKey = `event${ev.split(".").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("")}`;
                return (
                  <label
                    key={ev}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-[10px] border text-sm cursor-pointer transition-all",
                      selectedEvents.includes(ev)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                      className="h-4 w-4 rounded-[4px] text-primary"
                    />
                    {i(labelKey)}
                  </label>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button type="submit" disabled={!name || !url || selectedEvents.length === 0}>
              {webhook ? t("save") : i("addWebhook")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ───── Delete Confirmation ───── */
function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  i,
  t,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  i: (key: string) => string;
  t: (key: string) => string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{i("deleteWebhook")}</DialogTitle>
          <DialogDescription>{i("confirmDelete")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm}>{i("deleteWebhook")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───── Integrations Tab ───── */
function IntegrationsTab({ s, c }: { s: (key: string) => string; c: (key: string) => string }) {
  const i = useTranslations("integrations");
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState<WebhookData | null>(null);
  const [deleting, setDeleting] = useState<WebhookData | null>(null);
  const [expandedDeliveries, setExpandedDeliveries] = useState<string | null>(null);

  const fetchWebhooks = (withDeliveries = false) => {
    fetch(`/api/integrations/webhooks${withDeliveries ? "?deliveries=true" : ""}`)
      .then((r) => r.json())
      .then((d) => { if (d.webhooks) setWebhooks(d.webhooks); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const handleSave = async (data: { name: string; url: string; events: string[]; secret: string }) => {
    try {
      // Get the first org the user belongs to (API auto-detects from session if orgId not provided)
      if (editing) {
        await fetch("/api/integrations/webhooks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...data }),
        });
      } else {
        await fetch("/api/integrations/webhooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setShowDialog(false);
      setEditing(null);
      fetchWebhooks();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await fetch("/api/integrations/webhooks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleting.id }),
      });
      setShowDelete(false);
      setDeleting(null);
      fetchWebhooks();
    } catch {}
  };

  const toggleDeliveries = (id: string) => {
    if (expandedDeliveries === id) {
      setExpandedDeliveries(null);
    } else {
      setExpandedDeliveries(id);
      fetchWebhooks(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{i("webhooks")}</h2>
          <p className="text-sm text-muted-foreground">{i("webhookDesc")}</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditing(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4" />{i("addWebhook")}
        </Button>
      </div>

      {/* Webhook List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">{c("loading")}</div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary/10 mb-4">
              <Webhook className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-medium">{i("noWebhooks")}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm text-center">{i("noWebhooksDesc")}</p>
            <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setShowDialog(true); }}>
              <Plus className="h-4 w-4" />{i("addWebhook")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {webhooks.map((wh) => (
            <div key={wh.id}>
              <WebhookCard
                wh={wh}
                onEdit={() => { setEditing(wh); setShowDialog(true); }}
                onDelete={() => { setDeleting(wh); setShowDelete(true); }}
                onTest={() => {}}
                t={c}
                i={i}
              />

              {/* Expandable deliveries */}
              {expandedDeliveries === wh.id && wh.deliveries && (
                <Card className="mt-2 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{i("recentDeliveries")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {wh.deliveries.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">{i("noDeliveries")}</div>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {wh.deliveries.map((d) => (
                          <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                            <Badge variant={d.status === "success" ? "success" : d.status === "failed" ? "destructive" : "warning"} className="text-[9px] px-1.5">
                              {d.status === "success" ? i("success") : d.status === "failed" ? i("failed") : i("pending")}
                            </Badge>
                            <span className="text-muted-foreground font-mono">{d.event}</span>
                            <span className="text-muted-foreground">HTTP {d.statusCode || "—"}</span>
                            <span className="text-muted-foreground ml-auto">{d.duration}{i("ms")}</span>
                            <span className="text-muted-foreground">{new Date(d.createdAt).toLocaleTimeString("fr-FR")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Toggle deliveries button */}
              <button
                onClick={() => toggleDeliveries(wh.id)}
                className="w-full text-center py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {expandedDeliveries === wh.id ? c("less") : i("deliveryLog")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <WebhookDialog
        open={showDialog}
        onOpenChange={(v) => { setShowDialog(v); if (!v) setEditing(null); }}
        webhook={editing}
        onSave={handleSave}
        t={c}
        i={i}
      />
      <DeleteDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        i={i}
        t={c}
      />
    </div>
  );
}

/* ───── Profile Tab (connected to session) ───── */
function ProfileTab({ s, c }: { s: (key: string) => string; c: (key: string) => string }) {
  const [session, setSession] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        const u = data.user;
        if (u) {
          setSession(u);
          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
        }
      })
      .catch(() => {});
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      if (res.ok) {
        showToast("Profil mis à jour", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setSaving(false);
    }
  }

  const displayName = [session?.firstName, session?.lastName].filter(Boolean).join(" ") || session?.email || "Utilisateur";
  const initials = ((session?.firstName?.[0] || "") + (session?.lastName?.[0] || "")).toUpperCase() || "?";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{s("profile")}</CardTitle>
        <CardDescription>{s("profileDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <Badge variant="success">{s("accountVerified")}</Badge>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{s("firstName")}</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{s("lastName")}</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{s("email")}</label>
            <Input value={email} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{s("phone")}</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" />
          </div>
        </div>
        <Button className="gap-2" onClick={saveProfile} loading={saving}>
          <Save className="h-4 w-4" />
          {c("save")}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─=======================================================──
   MAIN SETTINGS PAGE
   ─=======================================================── */
export default function SettingsPage() {
  const s = useTranslations("settings");
  const c = useTranslations("common");
  const n = useTranslations("nav");
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: s("profile"), icon: User },
    { id: "security", label: s("security"), icon: Shield },
    { id: "appearance", label: s("appearance"), icon: Palette },
    { id: "notifications", label: s("notifications"), icon: Bell },
    { id: "billing", label: s("billing"), icon: CreditCard },
    { id: "api", label: s("api"), icon: Key },
    { id: "integrations", label: n("integrations"), icon: Webhook },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{s("title")}</h1>
        <p className="text-muted-foreground">{s("subtitle")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === "profile" && <ProfileTab s={s} c={c} />}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>{s("security")}</CardTitle>
                <CardDescription>{s("securityDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">{s("changePassword")}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{s("currentPassword")}</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{s("newPassword")}</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <Button variant="outline">{s("update")}</Button>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{s("mfa")}</h3>
                      <p className="text-xs text-muted-foreground">{s("mfaDesc")}</p>
                    </div>
                    <Button variant="outline" size="sm">{s("enable")}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>{s("appearance")}</CardTitle>
                <CardDescription>{s("appearanceDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">{s("theme")}</h3>
                  <div className="flex gap-3">
                    {[
                      { id: "light", label: s("light"), icon: Sun },
                      { id: "dark", label: s("dark"), icon: Moon },
                      { id: "system", label: s("system"), icon: Monitor },
                    ].map((theme) => (
                      <button key={theme.id} className="flex flex-col items-center gap-2 rounded-[14px] border-2 border-border/50 p-4 hover:border-primary/50 transition-all">
                        <theme.icon className="h-6 w-6" />
                        <span className="text-xs font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">{s("language")}</h3>
                  <select className="flex h-10 w-full max-w-xs rounded-[10px] border border-input bg-background px-3 py-2 text-sm">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="sw">Kiswahili</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>{s("notifications")}</CardTitle>
                <CardDescription>{s("notificationsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: s("pushNotifications"), desc: s("pushDesc") },
                  { label: s("emailNotifications"), desc: s("emailDesc") },
                  { label: s("mentions"), desc: s("mentionsDesc") },
                  { label: s("taskReminders"), desc: s("taskRemindersDesc") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card>
              <CardHeader>
                <CardTitle>{s("billing")}</CardTitle>
                <CardDescription>{s("billingDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-[12px] border border-border/50 bg-muted/30">
                  <div>
                    <p className="text-sm font-semibold">{s("currentPlan")}</p>
                    <p className="text-xs text-muted-foreground">{s("freeTrial")}</p>
                  </div>
                  <Badge variant="info">{s("free")}</Badge>
                </div>
                <Button variant="outline">{s("viewPlans")}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "api" && (
            <Card>
              <CardHeader>
                <CardTitle>{s("api")}</CardTitle>
                <CardDescription>{s("apiDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[12px] border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{s("apiKey")}</p>
                    <p className="text-xs text-muted-foreground font-mono">oc_••••••••••••••••</p>
                  </div>
                  <Button variant="ghost" size="sm">{s("regenerate")}</Button>
                </div>
                <Button variant="outline" size="sm">{s("createApiKey")}</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "integrations" && <IntegrationsTab s={s} c={c} />}
        </div>
      </div>
    </div>
  );
}

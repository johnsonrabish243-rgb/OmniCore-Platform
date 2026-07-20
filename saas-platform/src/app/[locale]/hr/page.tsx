"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { showToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  Briefcase,
  Search,
  Mail,
  MoreHorizontal,
  Trash,
} from "lucide-react";

export default function HRPage() {
  const t = useTranslations("hr");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");

  // New: orgs & pagination
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function fetchSessionOrgs() {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return;
      const body = await res.json();
      const orgs = body.user?.organizations || [];
      setOrgs(orgs);
      setSelectedOrgId(orgs[0]?.id || null);
    } catch (e) {
      // ignore
    }
  }

  async function fetchEmployees(p = page, orgId = selectedOrgId) {
    setLoading(true);
    try {
      const url = new URL(window.location.origin + "/api/hr/employees");
      url.searchParams.set("page", String(p));
      url.searchParams.set("limit", String(limit));
      if (orgId) url.searchParams.set("organizationId", orgId);

      const res = await fetch(url.toString());
      if (!res.ok) { showToast(t("fetchEmployeesFailed") || "Failed to load employees", "error"); setEmployees([]); return; }
      const body = await res.json();
      setEmployees(body.employees || []);
      setTotal(body.total || 0);
      setPage(body.page || p);
    } catch (e) {
      showToast(t("fetchEmployeesFailed") || "Failed to load employees", "error");
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchSessionOrgs(); }, []);
  useEffect(() => { fetchEmployees(1, selectedOrgId); }, [selectedOrgId]);

  function openAdd() {
    setEditingId(null);
    setEmail(""); setFirstName(""); setLastName(""); setJobTitle(""); setDepartment("");
    setInviteLink(null);
    setShowDialog(true);
  }

  function openEdit(emp: any) {
    setEditingId(emp.id);
    setEmail(emp.email || "");
    setFirstName(emp.name?.split(" ")[0] || "");
    setLastName(emp.name?.split(" ").slice(1).join(" ") || "");
    setJobTitle(emp.role || "");
    setDepartment(emp.department || "");
    setShowDialog(true);
  }

  function isValidEmail(e: string) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function saveEmployee() {
    if (editingId) {
      try {
        const res = await fetch(`/api/hr/employees/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, lastName, jobTitle, department }) });
        if (!res.ok) { const b = await res.json(); showToast(b.error || t("updateEmployeeFailed") || "Failed to update employee", "error"); return; }
        showToast(t("employeeUpdated") || "Employee updated", "success");
        setShowDialog(false); setEditingId(null);
        await fetchEmployees();
        await fetch("/api/admin/audit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_employee", entity: "employee", entityId: editingId, description: `Updated employee ${email}` }) });
      } catch (e) { showToast(t("updateEmployeeFailed") || "Failed to update employee", "error"); }
    } else {
      if (!email) { showToast(t("emailRequired") || "Email required", "warning"); return; }
      if (!isValidEmail(email)) { showToast(t("invalidEmail") || "Invalid email", "warning"); return; }
      try {
        const res = await fetch("/api/hr/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, firstName, lastName, jobTitle, department, organizationId: selectedOrgId }) });
        if (!res.ok) { const b = await res.json(); showToast(b.error || t("createEmployeeFailed") || "Failed to create employee", "error"); return; }
        const body = await res.json();
        showToast(t("employeeCreated") || "Employee created", "success");
        setShowDialog(false); setEmail(""); setFirstName(""); setLastName(""); setJobTitle(""); setDepartment("");
        await fetchEmployees(1, selectedOrgId);
        await fetch("/api/admin/audit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_employee", entity: "employee", entityId: body.employee?.id, description: `Created employee ${email}` }) });

        // If invite token returned in dev, surface it so admin can copy/send
        if (body.invite?.resetToken) {
          try {
            const token = body.invite.resetToken;
            const link = `${window.location.origin}/forgot-password?token=${token}`;
            setInviteLink(link);
            // Also print to console for server logs parity
            // Invite link generated (dev mode)
          } catch {
            // ignore
          }
        }
      } catch (e) { showToast(t("createEmployeeFailed") || "Failed to create employee", "error"); }
    }
  }

  async function deleteEmployee(emp: any) {
    if (!confirm(t("confirmDeleteEmployee") || "Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`/api/hr/employees/${emp.id}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json(); showToast(b.error || t("deleteEmployeeFailed") || "Failed to delete employee", "error"); return; }
      showToast(t("employeeDeleted") || "Employee deleted", "success");
      await fetchEmployees();
      await fetch("/api/admin/audit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_employee", entity: "employee", entityId: emp.id, description: `Deleted employee ${emp.email}` }) });
    } catch (e) { showToast(t("deleteEmployeeFailed") || "Failed to delete employee", "error"); }
  }

  const stats = [
    { label: t("employees"), value: `${total}`, change: "+0", icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("present"), value: "—", change: "", icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: t("onLeave"), value: "—", change: "", icon: Calendar, color: "bg-amber-50 text-amber-600" },
    { label: t("departments"), value: "—", change: "", icon: Briefcase, color: "bg-purple-50 text-purple-600" },
  ];

  const departments = [
    { name: "Engineering", count: 12, head: "Thomas Dubois" },
    { name: "Design", count: 5, head: "Sophie Martin" },
    { name: "Marketing", count: 8, head: "Lucas Bernard" },
    { name: "Finance", count: 4, head: "Camille Petit" },
    { name: "RH", count: 3, head: "Antoine Roux" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <UserPlus className="h-4 w-4" />
          {t("newEmployee")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] group-hover:scale-110 transition-all", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("employeesList")}</CardTitle>
                <CardDescription>{t("employeesListDesc")}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t("search")} className="pl-8 h-9" />
                </div>
                <Select onValueChange={(v:any) => setSelectedOrgId(v)} value={selectedOrgId || undefined}>
                  <SelectTrigger className="w-48 h-9"><SelectValue placeholder={t("selectOrganization") as any || "Organization"} /></SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="p-4 text-muted-foreground">{t("loading")}</div>
              ) : employees.length === 0 ? (
                <div className="p-4 text-muted-foreground">{t("noEmployees") || "No employees found"}</div>
              ) : (
                employees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {emp.name.split(" ").map((n:any) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role} · {emp.department}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(emp)} title={t("edit")}><MoreHorizontal className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteEmployee(emp)}><Trash className="h-4 w-4" /></Button>
                      <Badge variant={emp.status === "active" ? "success" : "warning"}>{emp.status === "active" ? t("active") : t("vacation")}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{t("showing")} {employees.length} / {total}</div>
              <div className="flex items-center gap-2">
                <Button disabled={page <= 1} onClick={() => { setPage((p) => Math.max(1, p - 1)); fetchEmployees(page - 1, selectedOrgId); }} variant="outline">{t("prev")}</Button>
                <div className="px-2">{page}</div>
                <Button disabled={page * limit >= total} onClick={() => { setPage((p) => p + 1); fetchEmployees(page + 1, selectedOrgId); }} variant="outline">{t("next")}</Button>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("departments")}</CardTitle>
            <CardDescription>Structure organisationnelle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{dept.count} {t("members")}</p>
                </div>
                <Badge variant="secondary">{dept.head.split(" ")[0]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employee Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { setShowDialog(v); if (!v) setEditingId(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? t("editEmployee") : t("newEmployee")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input placeholder={t("emailPlaceholder") || "Email"} value={email} onChange={(e) => setEmail(e.target.value)} />
            {!editingId && <Input placeholder={t("passwordPlaceholder") || "Password"} type="password" />}
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={t("firstName") || "First"} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder={t("lastName") || "Last"} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />

            {!editingId && (
              <div>
                <label className="text-sm font-medium">{t("selectOrganization")}</label>
                <Select onValueChange={(v:any) => setSelectedOrgId(v)} value={selectedOrgId || undefined}>
                  <SelectTrigger className="w-full h-9"><SelectValue placeholder={t("selectOrganization") as any || "Organization"} /></SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {inviteLink && (
              <div className="p-2 rounded-md bg-slate-50 border border-border/50">
                <div className="text-sm">{t("inviteLinkAvailable")}</div>
                <div className="text-xs text-muted-foreground break-all">{inviteLink}</div>
                <div className="mt-2">
                  <Button onClick={() => { navigator.clipboard.writeText(inviteLink || ""); showToast(t("copied") || "Copied", "success"); }}>{t("copyLink")}</Button>
                </div>
              </div>
            )}

          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setShowDialog(false); setEditingId(null); }}>{t("cancel")}</Button>
            <Button onClick={saveEmployee}>{editingId ? t("save") : t("create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

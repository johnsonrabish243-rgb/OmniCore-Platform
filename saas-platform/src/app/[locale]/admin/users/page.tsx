"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Ban, CheckCircle, MoreHorizontal, Trash, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { showToast } from "@/components/ui/toast";

import { useEffect, useState } from "react";

interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersData(data.users || []);
      } else {
        showToast(t("fetchUsersFailed") || "Failed to load users", "error");
      }
    } catch (e) {
      showToast(t("fetchUsersFailed") || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function createUser() {
    if (!email || !password) { showToast(t("emailPasswordRequired") || "Email and password required", "warning"); return; }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });
      const bodyRes = await res.json();
      if (!res.ok) {
        showToast(bodyRes.error || t("createUserFailed") || "Failed to create user", "error");
        return;
      }
      showToast(t("userCreated") || "User created", "success");
      setShowDialog(false);
      setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setRole("EMPLOYEE");
      await fetchUsers();
      // create audit log
      await fetch("/api/admin/audit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_user", entity: "user", entityId: bodyRes.user?.id, description: `Created user ${bodyRes.user?.email}` }) });
    } catch (e) {
      showToast(t("createUserFailed") || "Failed to create user", "error");
    }
  }

  async function toggleActive(u: UserData) {
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) {
        const b = await res.json();
        showToast(b.error || t("updateUserFailed") || "Failed to update user", "error");
        return;
      }
      showToast(u.isActive ? t("userSuspended") || "User suspended" : t("userActivated") || "User activated", "success");
      await fetchUsers();
      await fetch("/api/admin/audit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle_user_active", entity: "user", entityId: u.id, description: `Toggled isActive=${!u.isActive} for ${u.email}` }) });
    } catch (e) {
      showToast(t("updateUserFailed") || "Failed to update user", "error");
    }
  }

  async function deleteUser(u: UserData) {
    if (!confirm(t("confirmDeleteUser") || "Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const b = await res.json();
        showToast(b.error || t("deleteUserFailed") || "Failed to delete user", "error");
        return;
      }
      showToast(t("userDeleted") || "User deleted", "success");
      await fetchUsers();
      await fetch("/api/admin/audit-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_user", entity: "user", entityId: u.id, description: `Deleted user ${u.email}` }) });
    } catch (e) {
      showToast(t("deleteUserFailed") || "Failed to delete user", "error");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("manageUsersTitle")}</h1>
          <p className="text-muted-foreground">{loading ? "..." : usersData.length} {t("usersOnPlatform")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("search")} className="pl-8 w-48 h-9" />
          </div>
          <Button className="gap-2" onClick={() => setShowDialog(true)}><Plus className="h-4 w-4" /> {t("add")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("allUsers")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("user")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("email")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("role")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("status")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("registeredOn")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{t("loading")}</td></tr>
                ) : usersData.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé</td></tr>
                ) : usersData.map((user) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {(user.firstName?.[0] || "") + (user.lastName?.[0] || "") || "?"}
                        </div>
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.isActive ? "success" : "destructive"} className="text-[10px]">
                        {user.isActive ? t("active") : t("suspended")}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => toggleActive(user)}>
                          {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteUser(user)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => setShowDialog(v)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("addUser")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder={t("passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Select onValueChange={(v) => setRole(v)}>
              <SelectTrigger className="w-full h-10"><SelectValue placeholder={t("selectRole") as any} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="OWNER">OWNER</SelectItem>
                <SelectItem value="MANAGER">MANAGER</SelectItem>
                <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                <SelectItem value="GUEST">GUEST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>{t("cancel")}</Button>
            <Button onClick={createUser}>{t("create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Building2,
  Package,
  ShoppingCart,
  Pill,
  GraduationCap,
  Heart,
  Briefcase,
  BarChart3,
  Activity,
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  UserCheck,
  Calendar,
  AlertTriangle,
  BookOpen,
  Clock,
  DollarSign,
  Star,
  Server,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
interface SessionData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  activeWorkspace: { id: string; name: string; slug: string } | null;
  organizations: Array<{ id: string; name: string; role: string }>;
}

interface WorkspaceStats {
  employees: number;
  departments: number;
  modules: {
    medicines: number;
    patients: number;
    students: number;
    products: number;
    orders: number;
  };
}

interface RecentMember {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string | null;
  department: string | null;
}

/* ──────────────────────────────────────────────
   Skeleton Components
   ────────────────────────────────────────────── */
function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-20" />
          </div>
          <div className="skeleton h-12 w-12 rounded-[12px]" />
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="skeleton h-8 w-64 mb-2" />
      <div className="skeleton h-4 w-96 mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-6"><div className="skeleton h-[280px] w-full rounded-lg" /></CardContent></Card>
        <Card><CardContent className="p-6"><div className="skeleton h-[280px] w-full rounded-lg" /></CardContent></Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   HR Dashboard
   ────────────────────────────────────────────── */
function HRDashboard({ orgId }: { orgId: string | null }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    fetch(`/api/hr/employees?organizationId=${orgId}&limit=5`)
      .then((r) => r.json())
      .then((d) => { setEmployees(d.employees || []); setTotal(d.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return <DashboardSkeleton />;

  const departments = [...new Set(employees.map((e: any) => e.department).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Tableau de bord RH
          </h2>
          <p className="text-sm text-muted-foreground">Gestion des ressources humaines</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/hr"}>
          Gérer les employés
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Employés</p>
                <p className="text-2xl font-bold tracking-tight">{total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 group-hover:scale-110 transition-all">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Présents</p>
                <p className="text-2xl font-bold tracking-tight">—</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Départements</p>
                <p className="text-2xl font-bold tracking-tight">{departments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-all">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">En congé</p>
                <p className="text-2xl font-bold tracking-tight">—</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-all">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employés récents</CardTitle>
              <CardDescription>Derniers employés ajoutés</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/hr"}>Voir tout</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun employé</p>
            ) : (
              employees.map((emp: any) => (
                <div key={emp.id} className="flex items-center gap-3 p-2.5 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-sm font-bold dark:bg-blue-950/30">
                    {emp.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role} · {emp.department}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{emp.email}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions RH</CardTitle>
            <CardDescription>Gestion du personnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/hr"}>
              <Users className="h-4 w-4" /> Gérer les employés
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/hr"}>
              <UserCheck className="h-4 w-4" /> Suivi des présences
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/hr"}>
              <Calendar className="h-4 w-4" /> Gestion des congés
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/crm"}>
              <Briefcase className="h-4 w-4" /> CRM
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Pharmacy Dashboard
   ────────────────────────────────────────────── */
function PharmacyDashboard({ orgId }: { orgId: string | null }) {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    fetch(`/api/pharmacy/medicines?organizationId=${orgId}&limit=5`)
      .then((r) => r.json())
      .then((d) => { setMedicines(d.medicines || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return <DashboardSkeleton />;

  const totalStock = medicines.reduce((s, m) => s + (m.stock || 0), 0);
  const lowStock = medicines.filter((m) => (m.stock || 0) < 50).length;
  const totalValue = medicines.reduce((s, m) => s + (m.price || 0) * (m.stock || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Pill className="h-5 w-5 text-rose-500" />
            Tableau de bord Pharmacie
          </h2>
          <p className="text-sm text-muted-foreground">Gestion des médicaments et stocks</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/pharmacy"}>
          Gérer la pharmacie
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Médicaments</p>
                <p className="text-2xl font-bold tracking-tight">{medicines.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 group-hover:scale-110 transition-all">
                <Pill className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Stock total</p>
                <p className="text-2xl font-bold tracking-tight">{totalStock}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Stock bas</p>
                <p className="text-2xl font-bold tracking-tight text-amber-600">{lowStock}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-all">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
                <p className="text-2xl font-bold tracking-tight">{totalValue.toLocaleString("fr-FR")} €</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-all">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Médicaments en stock</CardTitle>
              <CardDescription>{medicines.length} produits référencés</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/pharmacy"}>Voir tout</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {medicines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun médicament</p>
            ) : (
              medicines.slice(0, 5).map((med: any) => (
                <div key={med.id} className="flex items-center gap-3 p-2.5 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-rose-50 text-rose-600 dark:bg-rose-950/30">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.dosage} · {med.category}</p>
                  </div>
                  <span className={cn("text-sm font-semibold", (med.stock || 0) < 30 ? "text-red-600" : (med.stock || 0) < 80 ? "text-amber-600" : "text-emerald-600")}>
                    {med.stock}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Alertes
            </CardTitle>
            <CardDescription>Stock bas à réapprovisionner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {medicines.filter((m) => (m.stock || 0) < 50).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune alerte</p>
            ) : (
              medicines.filter((m) => (m.stock || 0) < 50).slice(0, 4).map((med: any) => (
                <div key={med.id} className="flex items-center justify-between p-2 rounded-[8px] border border-amber-200/50 dark:border-amber-900/30">
                  <span className="text-sm font-medium truncate">{med.name}</span>
                  <span className="text-sm font-semibold text-amber-600">{med.stock}</span>
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => window.location.href = "/pharmacy"}>
              Gérer les stocks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Education Dashboard
   ────────────────────────────────────────────── */
function EducationDashboard({ orgId }: { orgId: string | null }) {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/education/students?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/education/teachers?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/education/classes?organizationId=${orgId}`).then((r) => r.json()),
    ])
      .then(([sData, tData, cData]) => {
        if (sData.students) setStudents(sData.students);
        if (tData.teachers) setTeachers(tData.teachers);
        if (cData.classes) setClasses(cData.classes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-500" />
            Tableau de bord Éducation
          </h2>
          <p className="text-sm text-muted-foreground">Gestion des étudiants, enseignants et classes</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/education"}>
          Gérer l'établissement
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Étudiants</p>
                <p className="text-2xl font-bold tracking-tight">{students.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-all">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Enseignants</p>
                <p className="text-2xl font-bold tracking-tight">{teachers.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Classes</p>
                <p className="text-2xl font-bold tracking-tight">{classes.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-all">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Taux présence</p>
                <p className="text-2xl font-bold tracking-tight">
                  {students.length > 0
                    ? `${Math.round(students.reduce((s, st) => s + (st.attendance || 0), 0) / students.length)}%`
                    : "—"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 group-hover:scale-110 transition-all">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Derniers étudiants</CardTitle><CardDescription>Inscriptions récentes</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun étudiant</p>
            ) : (
              students.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 text-xs font-bold">{s.firstName?.[0]}{s.lastName?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-muted-foreground">{s.grade || "Non classé"}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{s.attendance || 0}%</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actions rapides</CardTitle><CardDescription>Gestion scolaire</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/education"}><Users className="h-4 w-4" /> Étudiants</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/education"}><UserCheck className="h-4 w-4" /> Enseignants</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/education"}><BookOpen className="h-4 w-4" /> Classes</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/education"}><Clock className="h-4 w-4" /> Emplois</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Healthcare Dashboard
   ────────────────────────────────────────────── */
function HealthcareDashboard({ orgId }: { orgId: string | null }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/healthcare/patients?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/healthcare/appointments?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/healthcare/staff?organizationId=${orgId}`).then((r) => r.json()),
    ])
      .then(([pData, aData, sData]) => {
        if (pData.patients) setPatients(pData.patients);
        if (aData.appointments) setAppointments(aData.appointments);
        if (sData.staff) setStaff(sData.staff);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return <DashboardSkeleton />;

  const critical = patients.filter((p) => p.status === "critical").length;
  const todayAppts = appointments.filter((a) => a.status === "scheduled").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-500" />
            Tableau de bord Santé
          </h2>
          <p className="text-sm text-muted-foreground">Gestion des patients et rendez-vous</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/healthcare"}>
          Gérer la santé
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Patients</p>
                <p className="text-2xl font-bold tracking-tight">{patients.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Rendez-vous</p>
                <p className="text-2xl font-bold tracking-tight">{todayAppts}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 group-hover:scale-110 transition-all">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Cas critiques</p>
                <p className="text-2xl font-bold tracking-tight text-red-600">{critical}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 group-hover:scale-110 transition-all">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Personnel</p>
                <p className="text-2xl font-bold tracking-tight">{staff.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-all">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Patients récents</CardTitle><CardDescription>Derniers patients enregistrés</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {patients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun patient</p>
            ) : (
              patients.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">{p.firstName?.[0]}{p.lastName?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.condition} · {p.doctor}</p>
                  </div>
                  <Badge variant={p.status === "critical" ? "destructive" : "success"} className="text-[10px]">{p.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actions rapides</CardTitle><CardDescription>Gestion médicale</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/healthcare"}><Heart className="h-4 w-4" /> Patients</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/healthcare"}><Calendar className="h-4 w-4" /> Rendez-vous</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/healthcare"}><Users className="h-4 w-4" /> Personnel</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/pharmacy"}><Pill className="h-4 w-4" /> Pharmacie</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Commerce Dashboard
   ────────────────────────────────────────────── */
function CommerceDashboard({ orgId }: { orgId: string | null }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/commerce/orders?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/commerce/products?organizationId=${orgId}`).then((r) => r.json()),
    ])
      .then(([oData, pData]) => {
        if (oData.orders) setOrders(oData.orders);
        if (pData.products) setProducts(pData.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return <DashboardSkeleton />;

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-500" />
            Tableau de bord Commerce
          </h2>
          <p className="text-sm text-muted-foreground">Gestion des ventes et produits</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/commerce"}>
          Gérer le commerce
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold tracking-tight">{totalRevenue.toLocaleString("fr-FR")} €</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 text-primary group-hover:scale-110 transition-all">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold tracking-tight">{orders.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold tracking-tight text-amber-600">{pending}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-all">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Produits</p>
                <p className="text-2xl font-bold tracking-tight">{products.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-all">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Dernières commandes</CardTitle><CardDescription>Activité récente</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune commande</p>
            ) : (
              orders.slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-amber-50 text-amber-600 text-xs font-bold">{o.orderNumber?.slice(-4) || "—"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.customerName || "Client"}</p>
                    <p className="text-xs text-muted-foreground">{o.orderNumber}</p>
                  </div>
                  <span className="text-sm font-semibold">{o.total?.toFixed(2)} €</span>
                  <Badge variant={o.status === "delivered" ? "success" : o.status === "pending" ? "warning" : "info"} className="text-[10px]">{o.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actions rapides</CardTitle><CardDescription>Gestion commerciale</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/commerce"}><ShoppingCart className="h-4 w-4" /> Commandes</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/commerce"}><Package className="h-4 w-4" /> Produits</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/crm"}><Briefcase className="h-4 w-4" /> CRM</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/analytics"}><BarChart3 className="h-4 w-4" /> Analyses</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CRM Dashboard
   ────────────────────────────────────────────── */
function CRMDashboard({ orgId }: { orgId: string | null }) {
  const [deals, setDeals] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/crm/deals?organizationId=${orgId}`).then((r) => r.json()).catch(() => ({ deals: [] })),
      fetch(`/api/crm/leads?organizationId=${orgId}`).then((r) => r.json()).catch(() => ({ leads: [] })),
    ])
      .then(([dData, lData]) => {
        if (dData.deals) setDeals(dData.deals);
        if (lData.leads) setLeads(lData.leads);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) return <DashboardSkeleton />;

  const pipelineValue = deals.reduce((s, d) => {
    const val = parseFloat(String(d.value || "0").replace(/[^0-9,]/g, "").replace(",", "."));
    return s + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-500" />
            Tableau de bord CRM
          </h2>
          <p className="text-sm text-muted-foreground">Gestion de la relation client</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/crm"}>
          Gérer le CRM
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pipeline</p>
                <p className="text-2xl font-bold tracking-tight">{pipelineValue.toLocaleString("fr-FR")} €</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 text-primary group-hover:scale-110 transition-all">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Affaires</p>
                <p className="text-2xl font-bold tracking-tight">{deals.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold tracking-tight">{leads.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-all">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold tracking-tight">
                  {leads.length > 0 ? `${Math.round((deals.length / (leads.length + deals.length)) * 100)}%` : "—"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 group-hover:scale-110 transition-all">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Affaires récentes</CardTitle><CardDescription>Dernières opportunités</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune affaire</p>
            ) : (
              deals.slice(0, 5).map((d: any) => (
                <div key={d.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.company}</p>
                  </div>
                  <span className="text-sm font-semibold">{d.value}</span>
                  <Badge variant="secondary" className="text-[10px]">{d.stage}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actions rapides</CardTitle><CardDescription>Gestion commerciale</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/crm"}><Briefcase className="h-4 w-4" /> Affaires</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/crm"}><Users className="h-4 w-4" /> Contacts</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/crm"}><Star className="h-4 w-4" /> Leads</Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => window.location.href = "/commerce"}><ShoppingCart className="h-4 w-4" /> Ventes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Finance Dashboard
   ────────────────────────────────────────────── */
function FinanceDashboard({ orgId }: { orgId: string | null }) {
  const t = useTranslations("dashboard");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/commerce/orders?organizationId=${orgId}`).then(r => r.ok ? r.json() : { orders: [] }),
      fetch(`/api/commerce/products?organizationId=${orgId}`).then(r => r.ok ? r.json() : { products: [] }),
      fetch(`/api/hr/employees?organizationId=${orgId}`).then(r => r.ok ? r.json() : { employees: [] }),
    ]).then(([o, p, e]) => {
      setOrders(o.orders || []);
      setProducts(p.products || []);
      setEmployees(e.employees || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orgId]);

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "processing");

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("financialOverview") || "Financial Overview"}</h1>
          <p className="text-sm text-muted-foreground">{t("financialOverviewDesc") || "Revenue, payroll and orders summary"}</p>
        </div>
        <Badge variant="premium" className="gap-1"><DollarSign className="h-3 w-3" /> {t("finance") || "Finance"}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalRevenue") || "Revenue"}</p>
                <p className="text-2xl font-bold tracking-tight">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalOrders") || "Orders"}</p>
                <p className="text-2xl font-bold tracking-tight">{orders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("pendingOrders") || "Pending"}</p>
                <p className="text-2xl font-bold tracking-tight">{pendingOrders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("payrollEmployees") || "Payroll"}</p>
                <p className="text-2xl font-bold tracking-tight">{employees.length}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("recentOrders") || "Recent Orders"}</CardTitle>
            <CardDescription>{t("recentOrdersDesc") || "Latest 5 transactions"}</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">{t("noOrders") || "No orders yet"}</div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order: any, i: number) => (
                  <div key={order.id || i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{order.customer || `Order #${order.id?.slice(0, 8) || i + 1}`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${parseFloat(order.total || 0).toLocaleString()}</span>
                      <Badge variant={order.status === "delivered" ? "secondary" : order.status === "pending" ? "outline" : "default"} className="text-xs">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("quickActions") || "Quick Actions"}</CardTitle>
            <CardDescription>{t("quickActionsFinanceDesc") || "Finance operations"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/commerce"}><ShoppingCart className="h-4 w-4" /> {t("viewOrders") || "View Orders"}</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/hr"}><Users className="h-4 w-4" /> {t("managePayroll") || "Manage Payroll"}</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/commerce"}><Package className="h-4 w-4" /> {t("productCatalog") || "Product Catalog"}</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = "/crm"}><TrendingUp className="h-4 w-4" /> {t("salesAnalytics") || "Sales Analytics"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Inventory Dashboard
   ────────────────────────────────────────────── */
function InventoryDashboard({ orgId }: { orgId: string | null }) {
  const t = useTranslations("dashboard");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/pharmacy/medicines?organizationId=${orgId}`).then(r => r.ok ? r.json() : { medicines: [] }),
      fetch(`/api/commerce/products?organizationId=${orgId}`).then(r => r.ok ? r.json() : { products: [] }),
    ]).then(([m, p]) => {
      setMedicines([...(m.medicines || []), ...(p.products || []).map((pr: any) => ({ ...pr, stock: pr.stock || 0, name: pr.name, price: pr.price }))]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orgId]);

  const totalStock = medicines.reduce((sum: number, m: any) => sum + (parseInt(m.stock) || 0), 0);
  const lowStock = medicines.filter((m: any) => (parseInt(m.stock) || 0) < 10);
  const totalValue = medicines.reduce((sum: number, m: any) => sum + (parseFloat(m.price) || 0) * (parseInt(m.stock) || 0), 0);
  const uniqueCategories = [...new Set(medicines.map((m: any) => m.category || m.category || "Uncategorized"))];


  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("inventoryOverview") || "Inventory Overview"}</h1>
          <p className="text-sm text-muted-foreground">{t("inventoryOverviewDesc") || "Stock levels and product management"}</p>
        </div>
        <Badge variant="premium" className="gap-1"><Package className="h-3 w-3" /> {t("inventory") || "Inventory"}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalItems") || "Total Items"}</p>
                <p className="text-2xl font-bold tracking-tight">{medicines.length}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalStock") || "Total Stock"}</p>
                <p className="text-2xl font-bold tracking-tight">{totalStock}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Server className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("lowStock") || "Low Stock"}</p>
                <p className="text-2xl font-bold tracking-tight">{lowStock.length}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("totalValue") || "Total Value"}</p>
                <p className="text-2xl font-bold tracking-tight">${totalValue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("stockAlerts") || "Stock Alerts"}</CardTitle>
            <CardDescription>{t("stockAlertsDesc") || "Items requiring attention"}</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">{t("noStockAlerts") || "All items adequately stocked"}</div>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((item: any, i: number) => (
                  <div key={item.id || i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-sm">{item.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-red-600">{parseInt(item.stock) || 0} {t("units") || "units"}</span>
                      <Badge variant="destructive" className="text-xs">{t("lowStock") || "Low"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("categories") || "Categories"}</CardTitle>
            <CardDescription>{t("categoriesDesc") || "Product categories distribution"}</CardDescription>
          </CardHeader>
          <CardContent>
            {uniqueCategories.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">{t("noCategories") || "No categories yet"}</div>
            ) : (
              <div className="space-y-3">
                {uniqueCategories.slice(0, 6).map((cat, i) => {
                  const count = medicines.filter((m: any) => (m.category || "Uncategorized") === cat).length;
                  const catStock = medicines.filter((m: any) => (m.category || "Uncategorized") === cat).reduce((s: number, m: any) => s + (parseInt(m.stock) || 0), 0);
                  return (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-sm capitalize">{cat}</span>
                      <span className="text-sm text-muted-foreground">{count} items · {catStock} units</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/pharmacy"}><Pill className="h-4 w-4" /> {t("managePharmacy") || "Manage Pharmacy"}</Button>
        <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/commerce"}><ShoppingCart className="h-4 w-4" /> {t("manageProducts") || "Manage Products"}</Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Workspace Overview Dashboard (default)
   ────────────────────────────────────────────── */
function WorkspaceOverview({ displayName, workspaceName, stats, members }: {
  displayName: string;
  workspaceName: string;
  stats: WorkspaceStats | null;
  members: RecentMember[];
}) {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("welcome")}, {displayName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            {workspaceName ? `${workspaceName} · ` : ""}{t("welcomeMessage")}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="premium" className="text-xs gap-1">
            <LayoutDashboard className="h-3 w-3" />
            Tableau de bord
          </Badge>
        </div>
      </div>

      {/* Module Access Grid */}
      <div className="rounded-[16px] border border-border/50 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Modules disponibles</h3>
            <p className="text-xs text-muted-foreground">Accédez rapidement aux fonctionnalités de votre espace de travail</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "RH", icon: Users, href: "/hr", color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
            { label: "CRM", icon: Briefcase, href: "/crm", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
            { label: "Commerce", icon: ShoppingCart, href: "/commerce", color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
            { label: "Pharmacie", icon: Pill, href: "/pharmacy", color: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" },
            { label: "Éducation", icon: GraduationCap, href: "/education", color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" },
            { label: "Santé", icon: Heart, href: "/healthcare", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
          ].map((mod) => (
            <button
              key={mod.href}
              onClick={() => window.location.href = mod.href}
              className="group flex flex-col items-center gap-2 rounded-[12px] border border-border/40 bg-card p-3.5 text-sm font-medium transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-[10px] transition-all duration-200 group-hover:scale-110", mod.color)}>
                <mod.icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs">{mod.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Employés</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.employees || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 text-primary group-hover:scale-110 transition-all">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Départements</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.departments || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-all">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Produits</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.modules?.products || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-all">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold tracking-tight">{stats?.modules?.orders || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-all">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Membres récents</CardTitle>
              <CardDescription>Derniers membres ajoutés à l&apos;espace de travail</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/hr"}>Voir tout</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun membre récent</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-muted/50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {m.name.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.jobTitle || m.role} · {m.department || "Non spécifié"}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{m.role}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accédez aux fonctionnalités essentielles</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Employés", icon: Users, href: "/hr", color: "text-blue-500" },
              { label: "CRM", icon: TrendingUp, href: "/crm", color: "text-emerald-500" },
              { label: "Commandes", icon: ShoppingCart, href: "/commerce", color: "text-amber-500" },
              { label: "Pharmacie", icon: Pill, href: "/pharmacy", color: "text-rose-500" },
              { label: "Éducation", icon: GraduationCap, href: "/education", color: "text-purple-500" },
              { label: "Patients", icon: Heart, href: "/healthcare", color: "text-emerald-500" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => window.location.href = action.href}
                className="group flex flex-col items-center gap-2 rounded-[14px] border border-border/50 bg-card p-4 text-sm font-medium transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[10px] transition-all duration-200 group-hover:scale-110",
                  action.color === "text-blue-500" && "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
                  action.color === "text-emerald-500" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30",
                  action.color === "text-amber-500" && "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
                  action.color === "text-rose-500" && "bg-rose-50 text-rose-600 dark:bg-rose-950/30",
                  action.color === "text-purple-500" && "bg-purple-50 text-purple-600 dark:bg-purple-950/30",
                )}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span>{action.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Aperçu analytique
              </CardTitle>
              <CardDescription>Indicateurs clés de performance de votre espace de travail</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/analytics"}>
              Voir les analyses
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Médicaments", value: stats?.modules?.medicines || 0, icon: Pill, color: "text-rose-500" },
              { label: "Patients", value: stats?.modules?.patients || 0, icon: Heart, color: "text-emerald-500" },
              { label: "Étudiants", value: stats?.modules?.students || 0, icon: GraduationCap, color: "text-purple-500" },
              { label: "Activité", value: `${stats?.employees || 0} employés`, icon: Activity, color: "text-primary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-[10px] border border-border/40 hover:bg-accent/30 transition-colors">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary/10", item.color)}>
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Dashboard — Role Dispatcher
   ────────────────────────────────────────────── */
export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [members, setMembers] = useState<RecentMember[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          window.location.href = "/fr/login";
          return;
        }
        const data = await res.json();
        setSession(data.user);
        const orgs = data.user?.organizations || [];
        if (orgs.length > 0) setOrgId(orgs[0].id);

        // SUPER_ADMIN/ADMIN → admin dashboard
        if (data.user?.role === "SUPER_ADMIN" || data.user?.role === "ADMIN") {
          window.location.href = "/admin";
          return;
        }

        // Load workspace stats for the default view
        const wsRes = await fetch("/api/admin/workspace-stats");
        if (wsRes.ok) {
          const wsData = await wsRes.json();
          setStats(wsData.stats);
          setMembers(wsData.recentMembers || []);
          setWorkspaceName(wsData.workspace?.name || "");
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const displayName = session
    ? [session.firstName, session.lastName].filter(Boolean).join(" ") || session.email
    : "Utilisateur";

  const role = session?.role || "";

  // Route to role-specific dashboard
  switch (role) {
    case "HR":
      return <HRDashboard orgId={orgId} />;
    case "TEACHER":
    case "STUDENT":
      return <EducationDashboard orgId={orgId} />;
    case "SALES":
    case "CASHIER":
      return <CommerceDashboard orgId={orgId} />;
    case "FINANCE":
      return <FinanceDashboard orgId={orgId} />;
    case "INVENTORY":
      return <InventoryDashboard orgId={orgId} />;
    default:
      return (
        <WorkspaceOverview
          displayName={displayName}
          workspaceName={workspaceName}
          stats={stats}
          members={members}
        />
      );
  }
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { showToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Heart,
  Users,
  Calendar,
  Clock,
  Search,
  Plus,
  ArrowUpRight,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodType: string;
  condition: string;
  status: string;
  lastVisit: string;
  doctor: string;
}

interface Appointment {
  id: string;
  patientName: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
  patients: number;
}

export default function HealthcarePage() {
  const t = useTranslations("healthcare");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogEntity, setDialogEntity] = useState<"patient" | "appointment" | "staff">("patient");
  const [fFirstName, setFFirstName] = useState("");
  const [fLastName, setFLastName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fAge, setFAge] = useState(30);
  const [fGender, setFGender] = useState("");
  const [fBloodType, setFBloodType] = useState("");
  const [fCondition, setFCondition] = useState("");
  const [fDoctor, setFDoctor] = useState("");
  const [fDate, setFDate] = useState("");
  const [fTime, setFTime] = useState("");
  const [fType, setFType] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fPatientName, setFPatientName] = useState("");
  const [fRole, setFRole] = useState("");
  const [fDepartment, setFDepartment] = useState("");
  const [fPatientsCount, setFPatientsCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/healthcare/patients").then((r) => r.json()),
      fetch("/api/healthcare/appointments").then((r) => r.json()),
      fetch("/api/healthcare/staff").then((r) => r.json()),
    ])
      .then(([pData, aData, sData]) => {
        if (pData.patients) setPatients(pData.patients);
        if (aData.appointments) setAppointments(aData.appointments);
        if (sData.staff) setStaff(sData.staff);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function fetchAll() {
    const [pData, aData, sData] = await Promise.all([
      fetch("/api/healthcare/patients").then((r) => r.json()),
      fetch("/api/healthcare/appointments").then((r) => r.json()),
      fetch("/api/healthcare/staff").then((r) => r.json()),
    ]);
    if (pData.patients) setPatients(pData.patients);
    if (aData.appointments) setAppointments(aData.appointments);
    if (sData.staff) setStaff(sData.staff);
  }

  function resetForm() {
    setFFirstName(""); setFLastName(""); setFEmail(""); setFPhone("");
    setFAge(30); setFGender(""); setFBloodType(""); setFCondition("");
    setFDoctor(""); setFDate(""); setFTime(""); setFType(""); setFNotes("");
    setFPatientName(""); setFRole(""); setFDepartment(""); setFPatientsCount(0);
  }

  function openAdd(entity: "patient" | "appointment" | "staff") {
    setDialogEntity(entity); setEditingId(null); resetForm(); setShowDialog(true);
  }

  function openEdit(entity: "patient" | "appointment" | "staff", item: any) {
    setDialogEntity(entity); setEditingId(item.id); resetForm();
    if (entity === "patient") {
      setFFirstName(item.firstName || ""); setFLastName(item.lastName || "");
      setFEmail(item.email || ""); setFPhone(item.phone || "");
      setFAge(item.age || 30); setFGender(item.gender || "");
      setFBloodType(item.bloodType || ""); setFCondition(item.condition || "");
      setFDoctor(item.doctor || "");
    } else if (entity === "appointment") {
      setFPatientName(item.patientName || ""); setFDoctor(item.doctor || "");
      setFDate(item.date || ""); setFTime(item.time || "");
      setFType(item.type || ""); setFNotes(item.notes || "");
    } else if (entity === "staff") {
      setFFirstName(item.firstName || ""); setFLastName(item.lastName || "");
      setFEmail(item.email || ""); setFRole(item.role || "");
      setFDepartment(item.department || ""); setFPatientsCount(item.patientsCount || item.patients || 0);
    }
    setShowDialog(true);
  }

  async function saveItem() {
    try {
      const endpoint = dialogEntity === "patient" ? "patients" : dialogEntity === "appointment" ? "appointments" : "staff";
      let url = `/api/healthcare/${endpoint}`;
      let method = "POST";
      let body: any = {};
      if (editingId) { method = "PATCH"; body.id = editingId; }

      if (dialogEntity === "patient") {
        body = { ...body, firstName: fFirstName, lastName: fLastName, email: fEmail, phone: fPhone, age: fAge, gender: fGender, bloodType: fBloodType, condition: fCondition, doctor: fDoctor };
      } else if (dialogEntity === "appointment") {
        body = { ...body, patientName: fPatientName, doctor: fDoctor, date: fDate, time: fTime, type: fType, notes: fNotes };
      } else if (dialogEntity === "staff") {
        body = { ...body, firstName: fFirstName, lastName: fLastName, email: fEmail, role: fRole, department: fDepartment, patientsCount: fPatientsCount };
      }

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); showToast(err.error || "Erreur", "error"); return; }
      showToast(editingId ? "Mis à jour" : "Créé", "success");
      setShowDialog(false); await fetchAll();
    } catch { showToast("Erreur", "error"); }
  }

  async function deleteItem(id: string, endpoint: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    try {
      const res = await fetch(`/api/healthcare/${endpoint}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) { showToast("Échec de la suppression", "error"); return; }
      showToast("Supprimé", "success"); await fetchAll();
    } catch { showToast("Échec de la suppression", "error"); }
  }

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const criticalPatients = patients.filter((p) => p.status === "critical").length;
  const todayAppointments = appointments.filter(
    (a) => a.date === "2026-07-15"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Santé</h1>
          <p className="text-muted-foreground">Gérez vos patients, rendez-vous et personnels soignants</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openAdd("appointment")}>
            <Calendar className="h-4 w-4 mr-2" />
            Agenda
          </Button>
          <Button size="sm" onClick={() => openAdd("patient")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau patient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Patients", value: patients.length.toString(), change: "+2 cette semaine", icon: Users, color: "text-primary" },
          { label: "Rendez-vous", value: `${appointments.filter((a) => a.status !== "cancelled").length}`, change: `${todayAppointments} aujourd'hui`, icon: Calendar, color: "text-emerald-500" },
          { label: "Cas critiques", value: criticalPatients.toString(), change: "Nécessite attention", icon: AlertCircle, color: "text-red-500" },
          { label: "Personnel", value: staff.filter((s) => s.status === "active").length.toString(), change: "En service", icon: Stethoscope, color: "text-purple-500" },
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

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-1">
        {["overview", "patients", "appointments", "staff"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-[10px] transition-all",
              activeTab === tab
                ? "bg-card text-foreground border border-border/50 border-b-background -mb-px shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            {tab === "overview" ? "Aperçu" : tab === "patients" ? "Patients" : tab === "appointments" ? "Rendez-vous" : "Personnel"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Rendez-vous du jour
              </CardTitle>
              <CardDescription>15 juillet 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.filter((a) => a.date === "2026-07-15").length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Aucun rendez-vous aujourd'hui</p>
              ) : (
                appointments.filter((a) => a.date === "2026-07-15").map((apt) => (
                  <div key={apt.id} className="flex items-start gap-3 p-3 rounded-[10px] border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-sm font-medium",
                      apt.status === "in-progress" ? "bg-amber-50 text-amber-600" : "bg-primary/10 text-primary"
                    )}>
                      {apt.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor} · {apt.type}</p>
                      <p className="text-xs text-muted-foreground mt-1">{apt.notes}</p>
                    </div>
                    <Badge variant={apt.status === "in-progress" ? "warning" : "success"} className="text-[10px]">
                      {apt.status === "in-progress" ? "En cours" : "Planifié"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Patients critiques
              </CardTitle>
              <CardDescription>Nécessitent une attention immédiate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.filter((p) => p.status === "critical").length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Aucun patient critique</p>
              ) : (
                patients.filter((p) => p.status === "critical").map((p) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-[10px] border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-muted-foreground">{p.condition} · {p.age} ans · Groupe {p.bloodType}</p>
                      <p className="text-xs text-muted-foreground">Médecin traitant: {p.doctor}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "patients" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patients</CardTitle>
                <CardDescription>{filteredPatients.length} patients enregistrés</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Âge/Sang</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Condition</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Médecin</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <span className="font-medium">{p.firstName} {p.lastName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span>{p.age} ans</span>
                            <Badge variant="secondary" className="text-[9px]">{p.bloodType}</Badge>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{p.condition}</td>
                        <td className="p-4 text-sm">{p.doctor}</td>
                        <td className="p-4">
                          <Badge variant={
                            p.status === "critical" ? "destructive" : 
                            p.status === "stable" ? "success" : "info"
                          } className="text-[10px]">
                            {p.status === "critical" ? "Critique" : 
                             p.status === "stable" ? "Stable" : "En amélioration"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit("patient", p)} className="p-1 rounded-md hover:bg-muted transition-colors">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteItem(p.id, "patients")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
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
      )}

      {activeTab === "appointments" && (
        <Card>
          <CardHeader>
            <CardTitle>Tous les rendez-vous</CardTitle>
            <CardDescription>{appointments.length} rendez-vous</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Patient</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Médecin</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Heure</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{apt.patientName}</td>
                        <td className="p-4 text-muted-foreground">{apt.doctor}</td>
                        <td className="p-4 text-sm">{new Date(apt.date).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4 font-mono text-sm">{apt.time}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-[10px]">{apt.type}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            apt.status === "completed" ? "success" : 
                            apt.status === "in-progress" ? "warning" : "info"
                          } className="text-[10px]">
                            {apt.status === "completed" ? "Terminé" : 
                             apt.status === "in-progress" ? "En cours" : "Planifié"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit("appointment", apt)} className="p-1 rounded-md hover:bg-muted transition-colors">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteItem(apt.id, "appointments")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "staff" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id} className="group hover:shadow-lg transition-all relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{s.firstName} {s.lastName}</CardTitle>
                      <CardDescription>{s.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit("staff", s)} className="p-1 rounded-md hover:bg-muted transition-colors">
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteItem(s.id, "staff")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rôle</span>
                    <span className="font-medium">{s.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Département</span>
                    <Badge variant="secondary" className="text-[10px]">{s.department}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Patients</span>
                    <span className="font-semibold">{s.patients}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CRUD Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier" : "Nouveau"} {dialogEntity === "patient" ? "patient" : dialogEntity === "appointment" ? "rendez-vous" : "membre"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dialogEntity === "patient" && (
              <>
                <Input placeholder="Prénom" value={fFirstName} onChange={(e) => setFFirstName(e.target.value)} />
                <Input placeholder="Nom" value={fLastName} onChange={(e) => setFLastName(e.target.value)} />
                <Input placeholder="Email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
                <Input placeholder="Téléphone" value={fPhone} onChange={(e) => setFPhone(e.target.value)} />
                <Input type="number" placeholder="Âge" value={fAge} onChange={(e) => setFAge(Number(e.target.value))} />
                <Input placeholder="Sexe (M/F)" value={fGender} onChange={(e) => setFGender(e.target.value)} />
                <Input placeholder="Groupe sanguin" value={fBloodType} onChange={(e) => setFBloodType(e.target.value)} />
                <Input placeholder="Condition médicale" value={fCondition} onChange={(e) => setFCondition(e.target.value)} />
                <Input placeholder="Médecin traitant" value={fDoctor} onChange={(e) => setFDoctor(e.target.value)} />
              </>
            )}
            {dialogEntity === "appointment" && (
              <>
                <Input placeholder="Nom du patient" value={fPatientName} onChange={(e) => setFPatientName(e.target.value)} />
                <Input placeholder="Médecin" value={fDoctor} onChange={(e) => setFDoctor(e.target.value)} />
                <Input type="date" placeholder="Date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
                <Input type="time" placeholder="Heure" value={fTime} onChange={(e) => setFTime(e.target.value)} />
                <Input placeholder="Type (Consultation, Suivi...)" value={fType} onChange={(e) => setFType(e.target.value)} />
                <Input placeholder="Notes" value={fNotes} onChange={(e) => setFNotes(e.target.value)} />
              </>
            )}
            {dialogEntity === "staff" && (
              <>
                <Input placeholder="Prénom" value={fFirstName} onChange={(e) => setFFirstName(e.target.value)} />
                <Input placeholder="Nom" value={fLastName} onChange={(e) => setFLastName(e.target.value)} />
                <Input placeholder="Email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
                <Input placeholder="Rôle" value={fRole} onChange={(e) => setFRole(e.target.value)} />
                <Input placeholder="Département" value={fDepartment} onChange={(e) => setFDepartment(e.target.value)} />
                <Input type="number" placeholder="Nombre de patients" value={fPatientsCount} onChange={(e) => setFPatientsCount(Number(e.target.value))} />
              </>
            )}
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={saveItem}>{editingId ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

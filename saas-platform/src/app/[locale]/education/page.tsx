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
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  Star,
  Pencil,
  Trash2,
} from "lucide-react";

export default function EducationPage() {
  const t = useTranslations("education");
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogEntity, setDialogEntity] = useState<"student" | "teacher" | "class">("student");
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formAttendance, setFormAttendance] = useState(100);
  const [formClassId, setFormClassId] = useState("");
  const [formName, setFormName] = useState("");
  const [formLevel, setFormLevel] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formSchedule, setFormSchedule] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/education/students").then((r) => r.json()),
      fetch("/api/education/teachers").then((r) => r.json()),
      fetch("/api/education/classes").then((r) => r.json()),
    ])
      .then(([sData, tData, cData]) => {
        if (sData.students) setStudents(sData.students);
        if (tData.teachers) setTeachers(tData.teachers);
        if (cData.classes) setClasses(cData.classes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function fetchAll() {
    const [sData, tData, cData] = await Promise.all([
      fetch("/api/education/students").then((r) => r.json()),
      fetch("/api/education/teachers").then((r) => r.json()),
      fetch("/api/education/classes").then((r) => r.json()),
    ]);
    if (sData.students) setStudents(sData.students);
    if (tData.teachers) setTeachers(tData.teachers);
    if (cData.classes) setClasses(cData.classes);
  }

  function openAdd(entity: "student" | "teacher" | "class") {
    setDialogEntity(entity);
    setEditingId(null);
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormSubject("");
    setFormGrade("");
    setFormAttendance(100);
    setFormClassId("");
    setFormName("");
    setFormLevel("");
    setFormRoom("");
    setFormSchedule("");
    setShowDialog(true);
  }

  function openEdit(entity: "student" | "teacher" | "class", item: any) {
    setDialogEntity(entity);
    setEditingId(item.id);
    setFormFirstName(item.firstName || "");
    setFormLastName(item.lastName || "");
    setFormEmail(item.email || "");
    setFormSubject(item.subject || "");
    setFormGrade(item.grade || "");
    setFormAttendance(item.attendance ?? 100);
    setFormClassId(item.classId || "");
    setFormName(item.name || "");
    setFormLevel(item.level || "");
    setFormRoom(item.room || "");
    setFormSchedule(item.schedule || "");
    setShowDialog(true);
  }

  async function save() {
    try {
      let url = `/api/education/${dialogEntity}s`;
      let method = "POST";
      let body: any = {};

      if (editingId) {
        method = "PATCH";
        body.id = editingId;
      }

      if (dialogEntity === "student") {
        body = { ...body, firstName: formFirstName, lastName: formLastName, email: formEmail, grade: formGrade, attendance: formAttendance, classId: formClassId };
      } else if (dialogEntity === "teacher") {
        body = { ...body, firstName: formFirstName, lastName: formLastName, email: formEmail, subject: formSubject };
      } else if (dialogEntity === "class") {
        body = { ...body, name: formName, level: formLevel, room: formRoom, schedule: formSchedule };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json();
        showToast(errBody.error || "Erreur", "error");
        return;
      }

      showToast(editingId ? "Mis à jour" : "Créé", "success");
      setShowDialog(false);
      await fetchAll();
    } catch {
      showToast("Erreur", "error");
    }
  }

  async function deleteItem(id: string, entity: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    try {
      const res = await fetch(`/api/education/${entity}s`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { showToast("Échec de la suppression", "error"); return; }
      showToast("Supprimé", "success");
      await fetchAll();
    } catch { showToast("Échec de la suppression", "error"); }
  }

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (s.class || "").toLowerCase().includes(search.toLowerCase())
  );

  const averageAttendance = students.length
    ? Math.round(students.reduce((s, st) => s + (st.attendance || 0), 0) / students.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Éducation</h1>
          <p className="text-muted-foreground">Gérez vos étudiants, enseignants et classes</p>
        </div>
        <Button size="sm" onClick={() => openAdd("student")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("newStudent")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Étudiants", value: students.length.toString(), change: "+3 ce mois", icon: GraduationCap, color: "text-primary" },
          { label: "Enseignants", value: teachers.length.toString(), change: `${teachers.filter((t) => t.status === "active").length} actifs`, icon: BookOpen, color: "text-emerald-500" },
          { label: "Classes", value: classes.length.toString(), change: `${classes.filter((c) => c.status === "active").length} actives`, icon: Users, color: "text-amber-500" },
          { label: "Assiduité", value: `${averageAttendance}%`, change: "+2% vs mois dernier", icon: UserCheck, color: "text-purple-500" },
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
        {["overview", "students", "teachers", "classes"].map((tab) => (
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
            {tab === "overview" ? "Aperçu" : tab === "students" ? "Étudiants" : tab === "teachers" ? "Enseignants" : "Classes"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>Aperçu des classes et effectifs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{cls.name}</p>
                    <p className="text-xs text-muted-foreground">{cls.level} · Salle {cls.room}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{cls.students} élèves</span>
                    <Badge variant={cls.status === "active" ? "success" : "secondary"} className="text-[10px]">
                      {cls.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top étudiants</CardTitle>
              <CardDescription>Meilleurs résultats académiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {students
                .sort((a, b) => {
                  const aGrade = parseFloat(a.grade?.split("/")[0] || "0");
                  const bGrade = parseFloat(b.grade?.split("/")[0] || "0");
                  return bGrade - aGrade;
                })
                .slice(0, 5)
                .map((student, i) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                        i === 0 ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                      )}>
                        {i === 0 ? <Star className="h-4 w-4" /> : i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground">{student.class}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{student.grade}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Étudiants</CardTitle>
                <CardDescription>{filteredStudents.length} étudiants inscrits</CardDescription>
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
                      <th className="text-left p-4 font-medium text-muted-foreground">Étudiant</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Classe</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Moyenne</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Assiduité</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </div>
                            <span className="font-medium">{student.firstName} {student.lastName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{student.email}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-[10px]">{student.class}</Badge>
                        </td>
                        <td className="p-4 font-semibold">{student.grade}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={cn(
                                  "rounded-full h-2",
                                  student.attendance >= 90 ? "bg-emerald-500" : student.attendance >= 75 ? "bg-amber-500" : "bg-red-500"
                                )}
                                style={{ width: `${student.attendance}%` }}
                              />
                            </div>
                            <span className={cn(
                              "text-xs font-medium",
                              student.attendance >= 90 ? "text-emerald-600" : student.attendance >= 75 ? "text-amber-600" : "text-red-600"
                            )}>
                              {student.attendance}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={student.status === "active" ? "success" : "warning"} className="text-[10px]">
                            {student.status === "active" ? "Actif" : "Alerte"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit("student", student)} className="p-1 rounded-md hover:bg-muted transition-colors">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteItem(student.id, "student")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
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

      {activeTab === "teachers" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enseignants</CardTitle>
                <CardDescription>{teachers.length} enseignants</CardDescription>
              </div>
              <Button size="sm" onClick={() => openAdd("teacher")}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Enseignant</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Matière</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Classes</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Élèves</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 text-xs font-bold">
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-medium">{teacher.firstName} {teacher.lastName}</span>
                            <p className="text-xs text-muted-foreground">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="info" className="text-[10px]">{teacher.subject}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes?.map((cls: string) => (
                            <Badge key={cls} variant="secondary" className="text-[9px]">{cls}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{teacher.students}</td>
                      <td className="p-4">
                        <Badge variant={teacher.status === "active" ? "success" : "secondary"} className="text-[10px]">
                          {teacher.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit("teacher", teacher)} className="p-1 rounded-md hover:bg-muted transition-colors">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteItem(teacher.id, "teacher")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
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

      {activeTab === "classes" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="group hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{cls.name}</CardTitle>
                    <CardDescription>{cls.level}</CardDescription>
                  </div>
                  <Badge variant={cls.status === "active" ? "success" : "secondary"} className="text-[10px]">
                    {cls.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Élèves</span>
                  <span className="font-semibold">{cls.students}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enseignants</span>
                  <span className="font-semibold">{cls.teachers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Salle</span>
                  <span className="font-semibold">{cls.room}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border/30">
                  <Clock className="h-3 w-3" />
                  {cls.schedule}
                </div>            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* CRUD Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier" : "Ajouter"} {dialogEntity === "student" ? "l'étudiant" : dialogEntity === "teacher" ? "l'enseignant" : "la classe"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dialogEntity === "student" && (
              <>
                <Input placeholder="Prénom" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} />
                <Input placeholder="Nom" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} />
                <Input placeholder="Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                <Input placeholder="Note (ex: 15/20)" value={formGrade} onChange={(e) => setFormGrade(e.target.value)} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Assiduité: {formAttendance}%</span>
                  <Input type="range" min={0} max={100} value={formAttendance} onChange={(e) => setFormAttendance(Number(e.target.value))} className="flex-1" />
                </div>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </>
            )}
            {dialogEntity === "teacher" && (
              <>
                <Input placeholder="Prénom" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} />
                <Input placeholder="Nom" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} />
                <Input placeholder="Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                <Input placeholder="Matière" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />
              </>
            )}
            {dialogEntity === "class" && (
              <>
                <Input placeholder="Nom de la classe" value={formName} onChange={(e) => setFormName(e.target.value)} />
                <Input placeholder="Niveau" value={formLevel} onChange={(e) => setFormLevel(e.target.value)} />
                <Input placeholder="Salle" value={formRoom} onChange={(e) => setFormRoom(e.target.value)} />
                <Input placeholder="Emploi du temps" value={formSchedule} onChange={(e) => setFormSchedule(e.target.value)} />
              </>
            )}
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={save}>{editingId ? "Mettre à jour" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

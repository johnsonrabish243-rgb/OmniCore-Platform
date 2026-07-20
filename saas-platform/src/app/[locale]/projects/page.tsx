"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FolderKanban, Plus, MoreHorizontal, Calendar, Users, CheckCircle, Clock } from "lucide-react";

const projects = [
  { name: "Refonte Site Web", status: "active", progress: 75, deadline: "15 août 2026", members: 5, tasks: 24, completed: 18 },
  { name: "Application Mobile", status: "active", progress: 45, deadline: "30 sept 2026", members: 4, tasks: 32, completed: 14 },
  { name: "Migration Cloud", status: "review", progress: 90, deadline: "1 août 2026", members: 3, tasks: 16, completed: 14 },
  { name: "Campagne Marketing Q3", status: "planning", progress: 15, deadline: "1 sept 2026", members: 6, tasks: 20, completed: 3 },
  { name: "Mise à jour Sécurité", status: "active", progress: 60, deadline: "20 août 2026", members: 2, tasks: 12, completed: 7 },
  { name: "Plateforme E-learning", status: "done", progress: 100, deadline: "10 juil 2026", members: 8, tasks: 40, completed: 40 },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "default" }> = {
  active: { label: "En cours", variant: "info" },
  review: { label: "En revue", variant: "warning" },
  planning: { label: "Planification", variant: "secondary" },
  done: { label: "Terminé", variant: "success" },
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">Gérez vos projets et suivez leur avancement</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Projets actifs", value: projects.filter((p) => p.status === "active").length.toString(), icon: FolderKanban, color: "text-primary" },
          { label: "Tâches totales", value: projects.reduce((s, p) => s + p.tasks, 0).toString(), icon: CheckCircle, color: "text-emerald-500" },
          { label: "Tâches complétées", value: projects.reduce((s, p) => s + p.completed, 0).toString(), icon: CheckCircle, color: "text-amber-500" },
          { label: "Membres impliqués", value: [...new Set(projects.map((p) => p.members))].reduce((s, m) => s + m, 0).toString(), icon: Users, color: "text-purple-500" },
        ].map((stat) => (
          <Card key={stat.label} className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 group-hover:scale-110 transition-all", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Input placeholder="Rechercher un projet..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {(["all", "active", "review", "planning", "done"] as const).map((filter) => (
          <Button key={filter} variant="outline" size="sm" className="capitalize">
            {filter === "all" ? "Tous" : statusConfig[filter]?.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => {
          const config = statusConfig[project.status] || { label: project.status, variant: "default" as const };
          return (
            <Card key={project.name} className="group hover:shadow-lg transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{project.completed}/{project.tasks} tâches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{project.members}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{project.deadline}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

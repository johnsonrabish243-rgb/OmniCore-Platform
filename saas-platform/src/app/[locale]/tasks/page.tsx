"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Plus, Search, Calendar, User, Tag, MoreHorizontal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const initialTasks = [
  { id: 1, title: "Concevoir la page d'accueil", project: "Refonte Site Web", priority: "high", status: "in-progress", assignee: "Sophie M.", dueDate: "12 août" },
  { id: 2, title: "Intégrer l'API Stripe", project: "Application Mobile", priority: "high", status: "todo", assignee: "Thomas D.", dueDate: "15 août" },
  { id: 3, title: "Tests de sécurité", project: "Migration Cloud", priority: "medium", status: "review", assignee: "Marc L.", dueDate: "10 août" },
  { id: 4, title: "Rédiger documentation", project: "Refonte Site Web", priority: "low", status: "todo", assignee: "Marie L.", dueDate: "20 août" },
  { id: 5, title: "Optimiser les images", project: "Refonte Site Web", priority: "medium", status: "done", assignee: "Sophie M.", dueDate: "8 août" },
  { id: 6, title: "Configurer CI/CD", project: "Application Mobile", priority: "medium", status: "in-progress", assignee: "Thomas D.", dueDate: "14 août" },
  { id: 7, title: "Revue de code module X", project: "Migration Cloud", priority: "low", status: "todo", assignee: "Marc L.", dueDate: "18 août" },
  { id: 8, title: "Préparer présentation client", project: "Campagne Marketing", priority: "high", status: "in-progress", assignee: "Julie R.", dueDate: "11 août" },
];

const priorityColors: Record<string, string> = {
  high: "text-red-500 bg-red-50 dark:bg-red-950/30",
  medium: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  low: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
};

const statusLabels: Record<string, string> = {
  todo: "À faire",
  "in-progress": "En cours",
  review: "En revue",
  done: "Terminé",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleStatus = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const order = ["todo", "in-progress", "review", "done"];
        const idx = order.indexOf(t.status);
        return { ...t, status: order[(idx + 1) % order.length] };
      })
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground">Gérez vos tâches et suivez leur progression</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: tasks.length.toString(), icon: CheckSquare, color: "text-primary" },
          { label: "À faire", value: tasks.filter((t) => t.status === "todo").length.toString(), icon: Clock, color: "text-amber-500" },
          { label: "En cours", value: tasks.filter((t) => t.status === "in-progress").length.toString(), icon: Clock, color: "text-blue-500" },
          { label: "Terminées", value: tasks.filter((t) => t.status === "done").length.toString(), icon: CheckSquare, color: "text-emerald-500" },
        ].map((stat) => (
          <Card key={stat.label} className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 group-hover:scale-110 transition-all", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une tâche..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {(["all", "todo", "in-progress", "review", "done"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Toutes" : statusLabels[f]}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => toggleStatus(task.id)}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-all",
                    task.status === "done"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {task.status === "done" && <CheckSquare className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", task.status === "done" && "line-through text-muted-foreground")}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{task.project}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{task.assignee}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {task.dueDate}
                  </span>
                  <Badge variant="secondary" className={cn("text-[10px]", priorityColors[task.priority])}>
                    {task.priority === "high" ? "Haute" : task.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                  <Badge variant={task.status === "done" ? "success" : task.status === "in-progress" ? "info" : task.status === "review" ? "warning" : "secondary"}>
                    {statusLabels[task.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

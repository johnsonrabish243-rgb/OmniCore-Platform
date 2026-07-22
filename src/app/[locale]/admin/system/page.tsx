"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
} from "lucide-react";

const services = [
  {
    name: "Base de données PostgreSQL",
    status: "healthy",
    uptime: "99.99%",
    latency: "2ms",
    icon: Database,
    color: "text-emerald-500",
    lastChecked: "Il y a 30s",
  },
  {
    name: "API Serveur",
    status: "healthy",
    uptime: "99.97%",
    latency: "45ms",
    icon: Globe,
    color: "text-emerald-500",
    lastChecked: "Il y a 30s",
  },
  {
    name: "Cache Redis",
    status: "healthy",
    uptime: "100%",
    latency: "1ms",
    icon: Cpu,
    color: "text-emerald-500",
    lastChecked: "Il y a 30s",
  },
  {
    name: "Stockage Fichiers",
    status: "degraded",
    uptime: "99.5%",
    latency: "120ms",
    icon: HardDrive,
    color: "text-amber-500",
    lastChecked: "Il y a 30s",
  },
  {
    name: "Service Email",
    status: "healthy",
    uptime: "99.9%",
    latency: "350ms",
    icon: Wifi,
    color: "text-emerald-500",
    lastChecked: "Il y a 1min",
  },
  {
    name: "Authentification",
    status: "healthy",
    uptime: "99.99%",
    latency: "15ms",
    icon: Shield,
    color: "text-emerald-500",
    lastChecked: "Il y a 30s",
  },
];

const recentIncidents = [
  { id: 1, title: "Latence élevée sur le stockage", status: "resolved", date: "14 juil. 2026", duration: "45 min" },
  { id: 2, title: "Panne temporaire API REST", status: "resolved", date: "10 juil. 2026", duration: "12 min" },
  { id: 3, title: "Dégradation des performances BDD", status: "monitoring", date: "8 juil. 2026", duration: "En surveillance" },
];

export default function AdminSystemPage() {
  const t = useTranslations("admin");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            Santé du système
          </h1>
          <p className="text-muted-foreground">Surveillez l'état et les performances de l'infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs gap-1">
            <Activity className="h-3 w-3" />
            Tous les systèmes
          </Badge>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Global Status */}
      <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Tous les systèmes opérationnels</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Aucun incident majeur signalé - Temps de disponibilité global: 99.97%</p>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.name} className="group hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[10px]",
                    service.status === "healthy" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-amber-50 dark:bg-amber-950/30"
                  )}>
                    <service.icon className={cn("h-5 w-5", service.color)} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">Vérifié {service.lastChecked}</p>
                  </div>
                </div>
                {service.status === "healthy" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-[8px] bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Uptime</p>
                  <p className="text-sm font-semibold">{service.uptime}</p>
                </div>
                <div className="p-2 rounded-[8px] bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Latence</p>
                  <p className="text-sm font-semibold">{service.latency}</p>
                </div>
                <div className="p-2 rounded-[8px] bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Statut</p>
                  <Badge variant={service.status === "healthy" ? "success" : "warning"} className="text-[9px] mt-0.5">
                    {service.status === "healthy" ? "OK" : "Dégradé"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents récents</CardTitle>
          <CardDescription>Historique des incidents des 30 derniers jours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentIncidents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun incident récent</p>
          ) : (
            recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    incident.status === "resolved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                  )}>
                    {incident.status === "resolved" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{incident.title}</p>
                    <p className="text-xs text-muted-foreground">{incident.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={incident.status === "resolved" ? "success" : "warning"} className="text-[10px]">
                    {incident.status === "resolved" ? "Résolu" : "En surveillance"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{incident.duration}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

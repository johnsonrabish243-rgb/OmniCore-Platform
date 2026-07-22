"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";import {
  ArrowUpRight, TrendingUp, DollarSign, ShoppingCart, Plus, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthlySales = [
  { month: "Jan", ventes: 45000, objectif: 50000 },
  { month: "Fév", ventes: 52000, objectif: 55000 },
  { month: "Mar", ventes: 48000, objectif: 50000 },
  { month: "Avr", ventes: 61000, objectif: 58000 },
  { month: "Mai", ventes: 58000, objectif: 60000 },
  { month: "Juin", ventes: 72000, objectif: 65000 },
];

const topProducts = [
  { name: "Suite Pro", ventes: 45, revenu: "67 500 €", croissance: "+12%" },
  { name: "Pack Starter", ventes: 38, revenu: "22 800 €", croissance: "+8%" },
  { name: "Module CRM", ventes: 28, revenu: "42 000 €", croissance: "+15%" },
  { name: "API Accès", ventes: 22, revenu: "11 000 €", croissance: "+5%" },
  { name: "Support Premium", ventes: 18, revenu: "9 000 €", croissance: "+20%" },
];

export default function SalesPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventes</h1>
          <p className="text-muted-foreground">Suivez et gérez vos performances commerciales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle vente
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ventes du mois", value: "72 000 €", change: "+24%", icon: DollarSign, color: "text-primary" },
          { label: "Commandes", value: "156", change: "+12%", icon: ShoppingCart, color: "text-emerald-500" },
          { label: "Panier moyen", value: "462 €", change: "+8%", icon: TrendingUp, color: "text-amber-500" },
          { label: "Objectif atteint", value: "110%", change: "+15%", icon: TrendingUp, color: "text-purple-500" },
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performances des ventes</CardTitle>
            <CardDescription>Ventes vs objectifs mensuels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                  <Bar dataKey="ventes" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="objectif" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Produits</CardTitle>
            <CardDescription>Produits les plus vendus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.ventes} ventes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{product.revenu}</p>
                  <Badge variant="success" className="text-[10px]">{product.croissance}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

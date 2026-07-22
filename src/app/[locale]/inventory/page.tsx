"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Package, Search, AlertTriangle, Plus, ArrowUpRight, TrendingDown } from "lucide-react";

const inventoryItems = [
  { name: "MacBook Pro 16\"", sku: "MBP-16-M3", category: "Électronique", stock: 12, minStock: 5, status: "normal", price: "2 499 €" },
  { name: "Écran 27\" 4K", sku: "MON-27-4K", category: "Électronique", stock: 8, minStock: 3, status: "normal", price: "699 €" },
  { name: "Clavier Mécanique", sku: "KB-MECH", category: "Périphériques", stock: 2, minStock: 5, status: "low", price: "149 €" },
  { name: "Chaise Ergonomique", sku: "CHAIR-ERGO", category: "Mobilier", stock: 15, minStock: 5, status: "normal", price: "899 €" },
  { name: "Casque Audio Pro", sku: "HEAD-PRO", category: "Audio", stock: 0, minStock: 3, status: "out", price: "349 €" },
  { name: "Souris Sans Fil", sku: "MOUSE-WL", category: "Périphériques", stock: 25, minStock: 10, status: "normal", price: "89 €" },
  { name: "Hub USB-C", sku: "HUB-USBC", category: "Accessoires", stock: 4, minStock: 5, status: "low", price: "59 €" },
  { name: "Lampe Bureau LED", sku: "LAMP-LED", category: "Mobilier", stock: 10, minStock: 3, status: "normal", price: "129 €" },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const filtered = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = inventoryItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9,]/g, "").replace(",", "."));
    return sum + price * item.stock;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaire</h1>
          <p className="text-muted-foreground">Gérez votre stock et vos produits</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Produits total", value: inventoryItems.length.toString(), change: "+3", icon: Package, color: "text-primary" },
          { label: "Stock total", value: inventoryItems.reduce((s, i) => s + i.stock, 0).toString(), change: "", icon: Package, color: "text-emerald-500" },
          { label: "Rupture de stock", value: inventoryItems.filter((i) => i.status === "out").length.toString(), change: "À commander", icon: AlertTriangle, color: "text-red-500" },
          { label: "Valeur totale", value: `${totalValue.toLocaleString("fr-FR")} €`, change: "+5%", icon: TrendingDown, color: "text-purple-500" },
        ].map((stat) => (
          <Card key={stat.label} className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 group-hover:scale-110 transition-all", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des produits</CardTitle>
              <CardDescription>{filtered.length} articles en stock</CardDescription>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Produit</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Prix</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.sku} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{item.sku}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className={cn(
                              "rounded-full h-2 transition-all",
                              item.status === "out" ? "bg-destructive" : item.status === "low" ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, (item.stock / item.minStock) * 50)}%` }}
                          />
                        </div>
                        <span className="text-xs">{item.stock}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={item.status === "out" ? "destructive" : item.status === "low" ? "warning" : "success"}
                        className="text-[10px]"
                      >
                        {item.status === "out" ? "Rupture" : item.status === "low" ? "Stock bas" : "OK"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-semibold">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

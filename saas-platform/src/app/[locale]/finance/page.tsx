"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteGuard } from "@/components/route-guard";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  ArrowRight,
  FileText,
  Download,
  Filter,
  Calendar,
  Search,
  DownloadCloud,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FinanceOrder {
  id: string;
  customerName: string | null;
  total: number;
  status: string;
  createdAt: string;
}

interface FinanceProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string | null;
}

export default function FinancePage() {
  const t = useTranslations("commerce");
  const [orders, setOrders] = useState<FinanceOrder[]>([]);
  const [products, setProducts] = useState<FinanceProduct[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [oRes, pRes, eRes] = await Promise.all([
          fetch("/api/commerce/orders"),
          fetch("/api/commerce/products"),
          fetch("/api/hr/employees"),
        ]);
        if (oRes.ok) {
          const oData = await oRes.json();
          setOrders(oData.orders || []);
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(pData.products || []);
        }
        if (eRes.ok) {
          const eData = await eRes.json();
          setEmployees(eData.employees || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "processing");
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered");
  const productValue = products.reduce((sum: number, p: any) => sum + (parseFloat(p.price) || 0) * (parseInt(p.stock) || 0), 0);

  return (
    <RouteGuard moduleId="finance">
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-500" />
              Finance
            </h1>
            <p className="text-sm text-muted-foreground">Gestion financière — revenus, dépenses et analyses</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="premium" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Finances
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <DownloadCloud className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Chiffre d&apos;affaires</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {loading ? "..." : `${totalRevenue.toLocaleString()} €`}
                  </p>
                  <p className="text-xs text-muted-foreground">{orders.length} commandes</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:scale-110 transition-transform">
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
                  <p className="text-2xl font-bold tracking-tight">{loading ? "..." : orders.length}</p>
                  <p className="text-xs text-muted-foreground">{deliveredOrders.length} livrées</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 group-hover:scale-110 transition-transform">
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
                  <p className="text-2xl font-bold tracking-tight">{loading ? "..." : pendingOrders.length}</p>
                  <p className="text-xs text-muted-foreground">à traiter</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Filter className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Employés (Paie)</p>
                  <p className="text-2xl font-bold tracking-tight">{loading ? "..." : employees.length}</p>
                  <p className="text-xs text-muted-foreground">{products.length} produits</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Value */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Valeur du Stock
              </CardTitle>
              <CardDescription>Valorisation des produits en inventaire</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="skeleton h-16 w-full rounded-lg" />
              ) : (
                <div>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {productValue.toLocaleString()} €
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{products.length} produits</Badge>
                    <span className="text-xs text-muted-foreground">
                      {products.reduce((s, p: any) => s + (parseInt(p.stock) || 0), 0)} unités
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Aperçu Rapide
              </CardTitle>
              <CardDescription>Indicateurs financiers clés</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valeur moyenne des commandes</span>
                    <span className="text-sm font-semibold">
                      {orders.length > 0 ? `${(totalRevenue / orders.length).toFixed(2)} €` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taux de livraison</span>
                    <span className="text-sm font-semibold">
                      {orders.length > 0 ? `${((deliveredOrders.length / orders.length) * 100).toFixed(1)}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Produits par commande (moy.)</span>
                    <span className="text-sm font-semibold">—</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Dernières commandes</CardTitle>
              <CardDescription>Les 10 dernières transactions financières</CardDescription>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-8 h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Montant</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">Chargement...</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune commande trouvée</td>
                    </tr>
                  ) : (
                    orders.slice(0, 10).map((order: any) => (
                      <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{order.customerName || order.customer || `#${order.id?.slice(0, 8)}`}</td>
                        <td className="p-4 font-semibold">{parseFloat(order.total || 0).toLocaleString()} €</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              order.status === "delivered" ? "success" :
                              order.status === "pending" ? "outline" :
                              order.status === "processing" ? "secondary" :
                              order.status === "cancelled" ? "destructive" : "default"
                            }
                            className="text-[10px]"
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/commerce"}>
            <ShoppingCart className="h-4 w-4" />
            Gérer les commandes
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/hr"}>
            <Users className="h-4 w-4" />
            Gérer la paie
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/crm"}>
            <TrendingUp className="h-4 w-4" />
            Analyse des ventes
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/inventory"}>
            <Package className="h-4 w-4" />
            Inventaire
          </Button>
        </div>
      </div>
    </RouteGuard>
  );
}

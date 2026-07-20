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
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  Search,
  Plus,
  ArrowUpRight,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const salesData = [
  { month: "Jan", revenue: 28500, orders: 145 },
  { month: "Fév", revenue: 32200, orders: 168 },
  { month: "Mar", revenue: 29800, orders: 156 },
  { month: "Avr", revenue: 38500, orders: 192 },
  { month: "Mai", revenue: 36200, orders: 178 },
  { month: "Juin", revenue: 42800, orders: 215 },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  processing: <Eye className="h-3.5 w-3.5" />,
  shipped: <Truck className="h-3.5 w-3.5" />,
  delivered: <CheckCircle className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
};

export default function CommercePage() {
  const t = useTranslations("commerce");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Org state
  const [orgId, setOrgId] = useState<string | null>(null);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<"product" | "order">("product");
  const [pName, setPName] = useState("");
  const [pSku, setPSku] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pStock, setPStock] = useState(0);
  const [oCustName, setOCustName] = useState("");
  const [oCustEmail, setOCustEmail] = useState("");
  const [oNotes, setONotes] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        const orgs = data.user?.organizations || [];
        if (orgs.length > 0) setOrgId(orgs[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/commerce/orders?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/commerce/products?organizationId=${orgId}`).then((r) => r.json()),
    ])
      .then(([ordersData, productsData]) => {
        if (ordersData.orders) setOrders(ordersData.orders);
        if (productsData.products) setProducts(productsData.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function fetchAll() {
    if (!orgId) return;
    const [ordersData, productsData] = await Promise.all([
      fetch(`/api/commerce/orders?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/commerce/products?organizationId=${orgId}`).then((r) => r.json()),
    ]);
    if (ordersData.orders) setOrders(ordersData.orders);
    if (productsData.products) setProducts(productsData.products);
  }

  function resetForm() {
    setPName(""); setPSku(""); setPDesc(""); setPCategory("");
    setPPrice(0); setPStock(0); setOCustName(""); setOCustEmail(""); setONotes("");
  }

  function openAddProduct() {
    setDialogType("product"); setEditingId(null); resetForm(); setShowDialog(true);
  }

  function openEditProduct(prod: any) {
    setDialogType("product"); setEditingId(prod.id); resetForm();
    setPName(prod.name || ""); setPSku(prod.sku || ""); setPDesc(prod.description || "");
    setPCategory(prod.category || ""); setPPrice(prod.price || 0); setPStock(prod.stock || 0);
    setShowDialog(true);
  }

  function openAddOrder() {
    setDialogType("order"); setEditingId(null); resetForm(); setShowDialog(true);
  }

  function openEditOrder(order: any) {
    setDialogType("order"); setEditingId(order.id); resetForm();
    setOCustName(order.customerName || ""); setOCustEmail(order.customerEmail || "");
    setONotes(order.notes || "");
    setShowDialog(true);
  }

  async function saveItem() {
    try {
      if (dialogType === "product") {
        const body = { organizationId: orgId, name: pName, sku: pSku, description: pDesc, category: pCategory, price: pPrice, stock: pStock };
        if (editingId) {
          const res = await fetch("/api/commerce/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...body }) });
          if (!res.ok) { const e = await res.json(); showToast(e.error || t("updateFailed"), "error"); return; }
          showToast(t("updateSuccess"), "success");
        } else {
          const res = await fetch("/api/commerce/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          if (!res.ok) { const e = await res.json(); showToast(e.error || t("createFailed"), "error"); return; }
          showToast(t("createSuccess"), "success");
        }
      } else {
        const body = { organizationId: orgId, customerName: oCustName, customerEmail: oCustEmail, notes: oNotes, items: [] };
        if (editingId) {
          const res = await fetch("/api/commerce/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, status: "processing", ...body }) });
          if (!res.ok) { const e = await res.json(); showToast(e.error || t("updateFailed"), "error"); return; }
          showToast(t("updateSuccess"), "success");
        } else {
          const res = await fetch("/api/commerce/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          if (!res.ok) { const e = await res.json(); showToast(e.error || t("createFailed"), "error"); return; }
          showToast(t("createSuccess"), "success");
        }
      }
      setShowDialog(false);
      await fetchAll();
    } catch { showToast(t("fetchFailed"), "error"); }
  }

  async function deleteItem(id: string, type: "product" | "order") {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const endpoint = type === "product" ? "/api/commerce/products" : "/api/commerce/orders";
      const res = await fetch(endpoint, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) { showToast(t("deleteFailed"), "error"); return; }
      showToast(t("deleteSuccess"), "success");
      await fetchAll();
    } catch { showToast(t("deleteFailed"), "error"); }
  }

  const filteredOrders = orders.filter(
    (o) =>
      (o.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  const statusLabel: Record<string, string> = {
    pending: t("pending"),
    processing: t("processing"),
    shipped: t("shipped"),
    delivered: t("delivered"),
    cancelled: t("cancelled"),
  };

  const statusBadge: Record<string, "warning" | "info" | "secondary" | "success" | "destructive"> = {
    pending: "warning",
    processing: "info",
    shipped: "secondary",
    delivered: "success",
    cancelled: "destructive",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openAddProduct}>
            <Package className="h-4 w-4 mr-2" />
            {t("products")}
          </Button>
          <Button size="sm" onClick={openAddOrder}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newOrder")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("totalRevenue"), value: `${totalRevenue.toLocaleString("fr-FR")} €`, change: "+18.5%", icon: DollarSign, color: "text-primary" },
          { label: t("totalOrders"), value: orders.length.toString(), change: `+${orders.filter((o) => o.status === "delivered").length} ${t("deliveredOrders").toLowerCase()}`, icon: ShoppingBag, color: "text-emerald-500" },
          { label: t("pendingOrders"), value: pendingOrders.toString(), change: t("toProcess"), icon: Clock, color: "text-amber-500" },
          { label: t("products"), value: products.length.toString(), change: t("productsInCatalog"), icon: Package, color: "text-purple-500" },
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
        {["overview", "orders", "products"].map((tab) => (
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
            {tab === "overview" ? t("overview") : tab === "orders" ? t("orders") : t("products")}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("monthlyRevenue")}</CardTitle>
              <CardDescription>{t("overview")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="commerceRevGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#commerceRevGrad2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("monthlyOrders")}</CardTitle>
              <CardDescription>{t("overview")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                    <Bar dataKey="orders" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("orders")}</CardTitle>
                <CardDescription>{filteredOrders.length} {t("orders")}</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("search")} className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">{t("noOrders")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("orderNumber")}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("customer")}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("orderItems")}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("total")}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("status")}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("date")}</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-xs font-medium">{order.orderNumber}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {(order.customerName || "?")[0]}
                            </div>
                            <span className="font-medium">{order.customerName || "—"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{order.items?.length || 0}</td>
                        <td className="p-4 font-semibold">{order.total?.toLocaleString("fr-FR")} €</td>
                        <td className="p-4">
                          <Badge variant={statusBadge[order.status] || "secondary"} className="text-[10px] gap-1">
                            {statusIcons[order.status]}
                            {statusLabel[order.status] || order.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditOrder(order)} className="p-1 rounded-md hover:bg-muted transition-colors">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteItem(order.id, "order")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
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

      {activeTab === "products" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("catalog")}</CardTitle>
                <CardDescription>{filteredProducts.length} {t("products")}</CardDescription>
              </div>
              <Button size="sm" onClick={openAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                {t("newProduct")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("productName")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("sku")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("category")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("price")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("stock")}</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-medium">{product.name}</span>
                            <p className="text-xs text-muted-foreground">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{product.sku || "—"}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
                      </td>
                      <td className="p-4 font-semibold">{product.price?.toLocaleString("fr-FR")} €</td>
                      <td className="p-4">
                        <span className={(product.stock || 0) < 50 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                          {product.stock} {t("stock")?.toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditProduct(product)} className="p-1 rounded-md hover:bg-muted transition-colors">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteItem(product.id, "product")} className="p-1 rounded-md hover:bg-red-50 transition-colors">
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

      {/* CRUD Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "product"
                ? (editingId ? t("editProduct") : t("newProduct"))
                : t("newOrder")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dialogType === "product" ? (
              <>
                <Input placeholder={t("productName")} value={pName} onChange={(e) => setPName(e.target.value)} />
                <Input placeholder={t("sku")} value={pSku} onChange={(e) => setPSku(e.target.value)} />
                <Input placeholder={t("description")} value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
                <Input placeholder={t("category")} value={pCategory} onChange={(e) => setPCategory(e.target.value)} />
                <Input type="number" step="0.01" placeholder={t("price")} value={pPrice} onChange={(e) => setPPrice(Number(e.target.value))} />
                <Input type="number" placeholder={t("stock")} value={pStock} onChange={(e) => setPStock(Number(e.target.value))} />
              </>
            ) : (
              <>
                <Input placeholder={t("customer")} value={oCustName} onChange={(e) => setOCustName(e.target.value)} />
                <Input placeholder="Email client" value={oCustEmail} onChange={(e) => setOCustEmail(e.target.value)} />
                <Input placeholder={t("notes")} value={oNotes} onChange={(e) => setONotes(e.target.value)} />
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

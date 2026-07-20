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
  Pill,
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building2,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";

export default function PharmacyPage() {
  const t = useTranslations("pharmacy");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("medicines");

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<"medicine" | "movement">("medicine");
  const [mName, setMName] = useState("");
  const [mDosage, setMDosage] = useState("");
  const [mCategory, setMCategory] = useState("");
  const [mStock, setMStock] = useState(0);
  const [mPrice, setMPrice] = useState(0);
  const [mExpiryDate, setMExpiryDate] = useState("");
  const [mSupplier, setMSupplier] = useState("");
  const [mvMedicineId, setMvMedicineId] = useState("");
  const [mvType, setMvType] = useState("in");
  const [mvQuantity, setMvQuantity] = useState(0);
  const [mvNote, setMvNote] = useState("");

  // Fetch organizationId from session
  const [orgId, setOrgId] = useState<string | null>(null);

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
      fetch(`/api/pharmacy/medicines?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/pharmacy/stock?organizationId=${orgId}`).then((r) => r.json()),
    ])
      .then(([medData, stockData]) => {
        if (medData.medicines) setMedicines(medData.medicines);
        if (stockData.stockMovements) setStockMovements(stockData.stockMovements);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function fetchAll() {
    if (!orgId) return;
    const [medData, stockData] = await Promise.all([
      fetch(`/api/pharmacy/medicines?organizationId=${orgId}`).then((r) => r.json()),
      fetch(`/api/pharmacy/stock?organizationId=${orgId}`).then((r) => r.json()),
    ]);
    if (medData.medicines) setMedicines(medData.medicines);
    if (stockData.stockMovements) setStockMovements(stockData.stockMovements);
  }

  function resetForm() {
    setMName(""); setMDosage(""); setMCategory(""); setMStock(0);
    setMPrice(0); setMExpiryDate(""); setMSupplier("");
    setMvMedicineId(""); setMvType("in"); setMvQuantity(0); setMvNote("");
  }

  function openAddMedicine() {
    setDialogType("medicine"); setEditingId(null); resetForm(); setShowDialog(true);
  }

  function openEditMedicine(med: any) {
    setDialogType("medicine"); setEditingId(med.id); resetForm();
    setMName(med.name || ""); setMDosage(med.dosage || "");
    setMCategory(med.category || ""); setMStock(med.stock || 0);
    setMPrice(med.price || 0);
    setMExpiryDate(med.expiryDate ? med.expiryDate.split("T")[0] : "");
    setMSupplier(med.supplier || "");
    setShowDialog(true);
  }

  function openAddMovement() {
    setDialogType("movement"); setEditingId(null); resetForm(); setShowDialog(true);
  }

  async function saveItem() {
    try {
      if (dialogType === "medicine") {
        const body: any = { organizationId: orgId, name: mName, dosage: mDosage, category: mCategory, stock: mStock, price: mPrice, expiryDate: mExpiryDate, supplier: mSupplier };
        if (editingId) {
          const res = await fetch("/api/pharmacy/medicines", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...body }) });
          if (!res.ok) { const e = await res.json(); showToast(e.error || "Erreur", "error"); return; }
          showToast("Médicament mis à jour", "success");
        } else {
          const res = await fetch("/api/pharmacy/medicines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          if (!res.ok) { const e = await res.json(); showToast(e.error || "Erreur", "error"); return; }
          showToast("Médicament créé", "success");
        }
      } else {
        const body: any = { organizationId: orgId, medicineId: mvMedicineId, type: mvType, quantity: mvQuantity, note: mvNote };
        const res = await fetch("/api/pharmacy/stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const e = await res.json(); showToast(e.error || "Erreur", "error"); return; }
        showToast("Mouvement enregistré", "success");
      }
      setShowDialog(false);
      await fetchAll();
    } catch { showToast("Erreur", "error"); }
  }

  async function deleteMedicine(id: string) {
    if (!confirm("Supprimer ce médicament ?")) return;
    try {
      const res = await fetch("/api/pharmacy/medicines", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) { showToast("Échec suppression", "error"); return; }
      showToast("Supprimé", "success");
      await fetchAll();
    } catch { showToast("Échec suppression", "error"); }
  }

  const filtered = medicines.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = medicines.reduce((s, m) => s + (m.stock || 0), 0);
  const lowStockItems = medicines.filter((m) => (m.stock || 0) < 50).length;
  const totalValue = medicines.reduce((s, m) => s + (m.price || 0) * (m.stock || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openAddMovement}>
            <Package className="h-4 w-4 mr-2" />
            {t("movement")}
          </Button>
          <Button size="sm" onClick={openAddMedicine}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newMedicineBtn")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("medicines"), value: medicines.length.toString(), change: t("inStock") || "En stock", icon: Pill, color: "text-primary" },
          { label: t("totalStock"), value: totalStock.toString(), change: t("unit"), icon: Package, color: "text-emerald-500" },
          { label: t("lowStock"), value: lowStockItems.toString(), change: t("restock"), icon: AlertTriangle, color: "text-amber-500" },
          { label: t("totalValue"), value: `${totalValue.toLocaleString("fr-FR")} €`, change: t("purchasePrice"), icon: TrendingUp, color: "text-purple-500" },
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
        {["medicines", "stock", "alerts"].map((tab) => (
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
            {tab === "medicines" ? t("medicines") : tab === "stock" ? t("stockMovements") : t("alerts")}
          </button>
        ))}
      </div>

      {activeTab === "medicines" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("inventory")}</CardTitle>
                <CardDescription>{filtered.length} {t("productsInStock")}</CardDescription>
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
                    <tr className="border-b border-border/50">                        <th className="text-left p-4 font-medium text-muted-foreground">{t("medicine")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("dosage")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("category")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("stock")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("price")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("expiryDate")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("supplier")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((med) => (
                      <tr key={med.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{med.name}</td>
                        <td className="p-4 text-muted-foreground">{med.dosage}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-[10px]">{med.category}</Badge>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "font-medium",
                            (med.stock || 0) < 30 ? "text-red-600" : (med.stock || 0) < 80 ? "text-amber-600" : "text-emerald-600"
                          )}>
                            {med.stock}
                          </span>
                        </td>
                        <td className="p-4 font-semibold">{med.price?.toFixed(2)} €</td>
                        <td className="p-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString("fr-FR") : "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {med.supplier}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditMedicine(med)} className="p-1 rounded-md hover:bg-muted transition-colors">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteMedicine(med.id)} className="p-1 rounded-md hover:bg-red-50 transition-colors">
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

      {activeTab === "stock" && (
        <Card>
          <CardHeader>                <CardTitle>{t("stockMovements")}</CardTitle>
                <CardDescription>{t("stockHistory")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">                      <th className="text-left p-4 font-medium text-muted-foreground">{t("movementType")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("medicine")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("quantity")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("date")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("user")}</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">{t("note")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.map((mov) => {
                    const med = medicines.find((m) => m.id === mov.medicineId);
                    return (
                      <tr key={mov.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <Badge variant={mov.type === "in" ? "success" : "warning"} className="text-[10px]">
                            {mov.type === "in" ? t("in") : t("out")}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">{med?.name || mov.medicineId || "—"}</td>
                        <td className="p-4">
                          <span className={cn("font-semibold", mov.type === "in" ? "text-emerald-600" : "text-red-600")}>
                            {mov.type === "in" ? "+" : "-"}{mov.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(mov.createdAt || mov.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{mov.user}</td>
                        <td className="p-4 text-xs text-muted-foreground">{mov.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "alerts" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                {t("lowStock")}
              </CardTitle>
              <CardDescription>{t("restock")}</CardDescription>
            </CardHeader>
            <CardContent>
              {medicines.filter((m) => (m.stock || 0) < 50).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Aucun stock bas</p>
              ) : (
                <div className="space-y-2">
                  {medicines.filter((m) => (m.stock || 0) < 50).map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-3 rounded-[10px] border border-border/50">
                      <div>
                        <p className="text-sm font-medium">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage} · {med.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-600">{med.stock} unités</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Calendar className="h-5 w-5" />
                {t("upcomingExpiry")}
              </CardTitle>
              <CardDescription>{t("noExpiryAlerts")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-4 text-center">Aucun médicament proche de l'expiration</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CRUD Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "medicine"
                ? (editingId ? "Modifier le médicament" : "Nouveau médicament")
                : "Nouveau mouvement de stock"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dialogType === "medicine" ? (
              <>
                <Input placeholder="Nom du médicament" value={mName} onChange={(e) => setMName(e.target.value)} />
                <Input placeholder="Dosage (ex: 500mg)" value={mDosage} onChange={(e) => setMDosage(e.target.value)} />
                <Input placeholder="Catégorie" value={mCategory} onChange={(e) => setMCategory(e.target.value)} />
                <Input type="number" placeholder="Stock initial" value={mStock} onChange={(e) => setMStock(Number(e.target.value))} />
                <Input type="number" step="0.01" placeholder="Prix unitaire (€)" value={mPrice} onChange={(e) => setMPrice(Number(e.target.value))} />
                <Input type="date" placeholder="Date d'expiration" value={mExpiryDate} onChange={(e) => setMExpiryDate(e.target.value)} />
                <Input placeholder="Fournisseur" value={mSupplier} onChange={(e) => setMSupplier(e.target.value)} />
              </>
            ) : (
              <>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={mvMedicineId}
                  onChange={(e) => setMvMedicineId(e.target.value)}
                >
                  <option value="">Sélectionner un médicament</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>{med.name} - {med.dosage}</option>
                  ))}
                </select>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={mvType}
                  onChange={(e) => setMvType(e.target.value)}
                >
                  <option value="in">Entrée (réapprovisionnement)</option>
                  <option value="out">Sortie (vente/utilisation)</option>
                </select>
                <Input type="number" placeholder="Quantité" value={mvQuantity} onChange={(e) => setMvQuantity(Number(e.target.value))} />
                <Input placeholder="Note (optionnelle)" value={mvNote} onChange={(e) => setMvNote(e.target.value)} />
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

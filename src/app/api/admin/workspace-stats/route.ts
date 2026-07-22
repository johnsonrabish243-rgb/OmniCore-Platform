import { NextResponse } from "next/server";
import { getCurrentUser, getActiveWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const workspace = await getActiveWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Aucun espace de travail actif" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const orgId = workspace.organizationId;

    const [{ count: totalEmployees }, { count: totalPatients }, { count: totalStudents },
      { count: totalMedicines }, { count: totalProducts }, { count: totalOrders }] = await Promise.all([
      supabase.from("organization_members").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("patients").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("medicines").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
    ]);

    return NextResponse.json({
      employees: totalEmployees || 0,
      departments: 0,
      modules: {
        medicines: totalMedicines || 0,
        patients: totalPatients || 0,
        students: totalStudents || 0,
        products: totalProducts || 0,
        orders: totalOrders || 0,
      },
    });
  } catch (error) {
    console.error("Workspace stats error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id);

    const orgIds = memberships?.map((m) => m.organization_id) || [];

    let query = supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else {
      query = query.in("organization_id", orgIds);
    }

    const { data: orders } = await query;

    return NextResponse.json({ orders: orders || [], total: orders?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const moduleCheck = await requireModule("commerce");
    if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { organizationId, customerName, customerEmail, notes, items } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId requis" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const orderNumber = `CMD-${String((count || 0) + 1).padStart(6, "0")}`;

    let total = 0;
    const orderItems = (items || []).map((item: any) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      total += itemTotal;
      return {
        product_id: item.productId || null,
        name: item.name || "Article",
        quantity: item.quantity || 1,
        price: item.price || 0,
      };
    });

    const { data: order } = await supabase
      .from("orders")
      .insert({
        organization_id: organizationId,
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        status: "pending",
        total,
        notes,
      })
      .select()
      .single();

    if (order && orderItems.length > 0) {
      await supabase.from("order_items").insert(
        orderItems.map((item: any) => ({ ...item, order_id: order.id }))
      );
    }

    const { data: fullOrder } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", order?.id)
      .single();

    return NextResponse.json({ order: fullOrder });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { id, status, customerName, customerEmail, notes, total } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (customerName !== undefined) updateData.customer_name = customerName;
    if (customerEmail !== undefined) updateData.customer_email = customerEmail;
    if (notes !== undefined) updateData.notes = notes;
    if (total !== undefined) updateData.total = total;

    const { data: updated } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("*, items:order_items(*)")
      .single();

    return NextResponse.json({ order: updated });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    await supabase.from("orders").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

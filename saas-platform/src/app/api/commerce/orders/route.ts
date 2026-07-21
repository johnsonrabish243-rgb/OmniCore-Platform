import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { requireModule } from "@/lib/workspace-modules";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = createClient();

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
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const moduleCheck = await requireModule("commerce");
  if (moduleCheck) return NextResponse.json(moduleCheck, { status: moduleCheck.status });

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = createClient();

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

  // Generate order number
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const orderNumber = `CMD-${String((count || 0) + 1).padStart(6, "0")}`;

  // Calculate total from items
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
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = createClient();

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const updateData: Record<string, any> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.customerName !== undefined) updateData.customer_name = data.customerName;
  if (data.customerEmail !== undefined) updateData.customer_email = data.customerEmail;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.total !== undefined) updateData.total = data.total;

  const { data: updated } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select("*, items:order_items(*)")
    .single();

  return NextResponse.json({ order: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = createClient();

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await supabase.from("orders").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

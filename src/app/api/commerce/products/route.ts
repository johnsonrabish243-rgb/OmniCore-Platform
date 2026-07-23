import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(request: Request) {
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

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.in("organization_id", orgIds);
  }

  const { data: products } = await query;

  return NextResponse.json({ products: products || [], total: products?.length || 0 });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = await createClient();

  const body = await request.json();
  const { organizationId, name, sku, description, category, price, stock } = body;

  if (!organizationId || !name) {
    return NextResponse.json({ error: "organizationId et name requis" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .insert({
      organization_id: organizationId,
      name,
      sku,
      description,
      category,
      price: price || 0,
      stock: stock || 0,
    })
    .select()
    .single();

  return NextResponse.json({ product });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = await createClient();

  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { data: product } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ product });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { createClient } = await import("@/lib/create-insforge-client");
  const supabase = await createClient();

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await supabase.from("products").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

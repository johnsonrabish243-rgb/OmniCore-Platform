import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

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

    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else {
      query = query.in("organization_id", orgIds);
    }

    const { data: products } = await query;

    return NextResponse.json({ products: products || [], total: products?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { organizationId, name, sku, description, category, price, stock } = body;

    if (!organizationId || !name) {
      return NextResponse.json({ error: "organizationId et name requis" }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single();

    if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

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
    const { id, name, sku, description, category, price, stock, isActive } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: product } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json({ product });
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

    await supabase.from("products").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

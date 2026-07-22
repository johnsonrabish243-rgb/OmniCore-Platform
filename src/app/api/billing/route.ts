import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);

  const orgIds = memberships?.map((m) => m.organization_id) || [];

  const { data: billing } = await supabase
    .from("billing")
    .select("*, invoices(*)")
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  return NextResponse.json({ billing: billing || [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const supabase = await createClient();
  const body = await request.json();
  const { organizationId, tier } = body;

  if (!organizationId || !tier) {
    return NextResponse.json({ error: "organizationId et tier requis" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("is_owner", true)
    .single();

  if (!membership && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("billing")
    .select("*")
    .eq("organization_id", organizationId)
    .single();

  if (existing) {
    const { data: updated } = await supabase
      .from("billing")
      .update({ tier, status: "ACTIVE" })
      .eq("organization_id", organizationId)
      .select("*, invoices(*)")
      .single();

    return NextResponse.json({ billing: updated });
  }

  const { data: billing } = await supabase
    .from("billing")
    .insert({
      organization_id: organizationId,
      tier,
      status: "TRIALING",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("*, invoices(*)")
    .single();

  return NextResponse.json({ billing });
}

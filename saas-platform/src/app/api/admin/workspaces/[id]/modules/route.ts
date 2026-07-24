import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("settings")
      .eq("id", id)
      .single();

    const settings = workspace?.settings || {};
    const enabledModules = typeof settings === "object" ? (settings as any).enabledModules || [] : [];

    return NextResponse.json({ enabledModules });
  } catch (error) {
    console.error("Failed to fetch workspace modules");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("settings")
      .eq("id", id)
      .single();

    const currentSettings = workspace?.settings || {};
    const updatedSettings = {
      ...(typeof currentSettings === "object" ? currentSettings : {}),
      enabledModules: body.modules || [],
    };

    await supabase
      .from("workspaces")
      .update({ settings: updatedSettings })
      .eq("id", id);

    return NextResponse.json({ success: true, enabledModules: body.modules || [] });
  } catch (error) {
    console.error("Failed to update workspace modules");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

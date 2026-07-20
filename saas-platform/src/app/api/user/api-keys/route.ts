import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

function generateApiKey(): string {
  return `oc_${randomBytes(32).toString("hex")}`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: apiKeys } = await supabase
      .from("api_keys")
      .select("id, name, key, permissions, last_used_at, expires_at, is_active, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Mask keys for security
    const masked = (apiKeys || []).map((k: any) => ({
      ...k,
      key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
    }));

    return NextResponse.json({ apiKeys: masked });
  } catch (error) {
    console.error("API keys fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions, expiresAt } = body;

    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const { data: apiKey } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        name,
        key: generateApiKey(),
        permissions: permissions || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      .select("id, name, key, permissions, expires_at")
      .single();

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("API keys POST error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { keyId } = body;

    if (!keyId) return NextResponse.json({ error: "keyId requis" }, { status: 400 });

    await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API keys DELETE error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: devices } = await supabase
      .from("devices")
      .select("*")
      .eq("user_id", user.id)
      .order("last_used_at", { ascending: false });

    return NextResponse.json({ devices: devices || [] });
  } catch (error) {
    console.error("Devices fetch error");
    return NextResponse.json({ devices: [] });
  }
}

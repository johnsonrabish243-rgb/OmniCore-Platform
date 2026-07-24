import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: notifications } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error("Notifications fetch error");
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { notificationId, markAllRead } = await request.json();

    if (markAllRead) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
    } else if (notificationId) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications update error");
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

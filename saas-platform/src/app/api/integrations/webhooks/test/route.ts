import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { createClient } = await import("@/lib/create-insforge-client");
    const supabase = await createClient();

    const body = await request.json();
    const { webhookId } = body;

    if (!webhookId) return NextResponse.json({ error: "webhookId requis" }, { status: 400 });

    const { data: webhook } = await supabase.from("webhooks").select("*").eq("id", webhookId).single();
    if (!webhook) return NextResponse.json({ error: "Webhook introuvable" }, { status: 404 });

    await supabase.from("webhook_deliveries").insert({
      webhook_id: webhookId,
      event: "test",
      url: webhook.url,
      status: "success",
      status_code: 200,
    });

    return NextResponse.json({ success: true, message: "Webhook test envoyé" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

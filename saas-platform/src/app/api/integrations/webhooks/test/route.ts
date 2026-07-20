import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { webhookId } = await request.json();
  if (!webhookId) return NextResponse.json({ error: "webhookId requis" }, { status: 400 });

  const webhook = await prisma.webhook.findUnique({ where: { id: webhookId } });
  if (!webhook) return NextResponse.json({ error: "Webhook introuvable" }, { status: 404 });

  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: webhook.organizationId, userId: user.id },
  });
  if (!membership) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Build test payload
  const payload = {
    event: "test",
    timestamp: new Date().toISOString(),
    data: {
      message: "Ceci est un test de votre webhook OmniCore",
      version: "1.0",
    },
  };

  const startTime = Date.now();
  let statusCode = 0;
  let responseBody = "";

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": webhook.secret || "",
        "X-Event-Type": "test",
      },
      body: JSON.stringify(payload),
    });
    statusCode = response.status;
    responseBody = await response.text();
  } catch (err: any) {
    statusCode = 0;
    responseBody = err.message || "Erreur de connexion";
  }

  const duration = Date.now() - startTime;

  // Record delivery
  await prisma.webhookDelivery.create({
    data: {
      webhookId,
      event: "test",
      url: webhook.url,
      status: statusCode >= 200 && statusCode < 300 ? "success" : "failed",
      statusCode,
      requestBody: JSON.stringify(payload),
      responseBody,
      duration,
    },
  });

  return NextResponse.json({
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    duration,
    responseBody: responseBody.slice(0, 500),
  });
}

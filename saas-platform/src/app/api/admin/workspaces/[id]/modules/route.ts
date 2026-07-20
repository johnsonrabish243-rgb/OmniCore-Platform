import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

const ALL_MODULES = [
  "hr", "finance", "crm", "commerce", "sales", "inventory",
  "pharmacy", "education", "healthcare",
  "projects", "tasks", "calendar", "messages", "documents",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) {
    return NextResponse.json({ error: "Espace de travail introuvable" }, { status: 404 });
  }

  const settings = typeof workspace.settings === "string"
    ? JSON.parse(workspace.settings)
    : (workspace.settings || {});
  const enabledModules = settings.enabledModules || [];

  return NextResponse.json({
    workspaceId: id,
    enabledModules,
    allModules: ALL_MODULES,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { enabledModules } = body;

  if (!Array.isArray(enabledModules)) {
    return NextResponse.json({ error: "enabledModules doit être un tableau" }, { status: 400 });
  }

  // Validate module names
  const invalid = enabledModules.filter((m: string) => !ALL_MODULES.includes(m));
  if (invalid.length > 0) {
    return NextResponse.json({ error: `Modules invalides: ${invalid.join(", ")}` }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) {
    return NextResponse.json({ error: "Espace de travail introuvable" }, { status: 404 });
  }

  const existingSettings = typeof workspace.settings === "string"
    ? JSON.parse(workspace.settings)
    : (workspace.settings || {});

  const updated = await prisma.workspace.update({
    where: { id },
    data: {
      settings: {
        ...existingSettings,
        enabledModules,
      },
    },
  });

  return NextResponse.json({
    workspaceId: id,
    enabledModules,
    message: "Modules mis à jour avec succès",
  });
}

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getActiveWorkspace } from "@/lib/auth-helpers";

/**
 * Checks if a specific module is enabled for the user's active workspace.
 * Returns true if the user is SUPER_ADMIN/ADMIN (they bypass module restrictions).
 */
export async function isModuleEnabled(moduleId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Admins bypass module restrictions
  if (["SUPER_ADMIN", "ADMIN"].includes(user.role)) return true;

  const activeWorkspace = await getActiveWorkspace();
  if (!activeWorkspace) return false;

  const settings = typeof activeWorkspace.settings === "string"
    ? JSON.parse(activeWorkspace.settings)
    : (activeWorkspace.settings || {});

  const enabledModules: string[] = settings.enabledModules || [];

  // If no modules explicitly defined, allow all (backward compatible)
  if (enabledModules.length === 0) return true;

  return enabledModules.includes(moduleId);
}

/**
 * Returns the list of enabled module IDs for the current workspace, or all if none configured.
 */
export async function getEnabledModules(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const activeWorkspace = await getActiveWorkspace();
  if (!activeWorkspace) return [];

  const settings = typeof activeWorkspace.settings === "string"
    ? JSON.parse(activeWorkspace.settings)
    : (activeWorkspace.settings || {});

  return settings.enabledModules || [];
}

/**
 * Middleware-like validation for API routes.
 * Returns an error response object if the module is disabled.
 * Returns null if access is allowed.
 */
export async function requireModule(moduleId: string): Promise<{ error: string; status: number } | null> {
  if (await isModuleEnabled(moduleId)) return null;
  return { error: "Ce module n'est pas activé pour votre espace de travail", status: 403 };
}

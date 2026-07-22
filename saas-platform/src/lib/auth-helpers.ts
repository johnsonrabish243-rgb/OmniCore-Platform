import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Get the currently authenticated Supabase user.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch additional user data from the users table
    const { data: profile } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, is_active, avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      isActive: profile.is_active,
      avatarUrl: profile.avatar_url,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
export async function getActiveWorkspace() {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("activeWorkspace")?.value;
    if (!activeWorkspaceId) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", activeWorkspaceId)
      .single();

    if (!workspace || !workspace.is_active) return null;

    // Verify membership
    const { data: membership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", workspace.organization_id)
      .eq("user_id", user.id)
      .single();

    // Check if user is SUPER_ADMIN (by querying their role)
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!membership && profile?.role !== "SUPER_ADMIN") return null;

    // Transform to camelCase for compatibility
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      organizationId: workspace.organization_id,
      description: workspace.description,
      type: workspace.type,
      settings: workspace.settings,
      isActive: workspace.is_active,
    };
  } catch (error) {
    console.error("getActiveWorkspace error:", error);
    return null;
  }
}

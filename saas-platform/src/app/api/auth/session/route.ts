import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch full user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch organization memberships
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id, role, is_owner, organizations:organization_id(id, name, slug, logo_url, tier)")
      .eq("user_id", user.id);

    const activeWorkspace = await getActiveWorkspace();

    // Parse workspace settings for enabled modules
    let enabledModules: string[] = [];
    if (activeWorkspace?.settings) {
      const settings = typeof activeWorkspace.settings === "string"
        ? JSON.parse(activeWorkspace.settings)
        : activeWorkspace.settings;
      enabledModules = settings.enabledModules || [];
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        isActive: profile.is_active,
        phone: profile.phone,
        bio: profile.bio,
        language: profile.language,
        timezone: profile.timezone,
        organizations: memberships?.map((m: any) => ({
          ...m.organizations,
          role: m.role,
          isOwner: m.is_owner,
        })) || [],
        activeWorkspace: activeWorkspace
          ? {
              id: activeWorkspace.id,
              name: activeWorkspace.name,
              slug: activeWorkspace.slug,
              organizationId: activeWorkspace.organizationId,
              settings: activeWorkspace.settings,
              enabledModules,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Session fetch error");
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

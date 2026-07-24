import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    // If client requests to set an active workspace, validate membership and set cookie
    if (body.activeWorkspaceId) {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", body.activeWorkspaceId)
        .single();

      if (!workspace || !workspace.is_active) {
        return NextResponse.json({ error: "Workspace introuvable" }, { status: 404 });
      }

      // Verify membership
      const { data: membership } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", workspace.organization_id)
        .eq("user_id", user.id)
        .single();

      // Check if user is SUPER_ADMIN
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!membership && profile?.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }

      const cookieStore = await cookies();
      cookieStore.set("activeWorkspace", body.activeWorkspaceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    // Update user profile fields
    const updates: Record<string, any> = {};
    if (body.firstName) updates.first_name = body.firstName;
    if (body.lastName) updates.last_name = body.lastName;
    if (body.email) updates.email = body.email;
    if (body.phone) updates.phone = body.phone;
    if (body.bio) updates.bio = body.bio;
    if (body.language) updates.language = body.language;
    if (body.timezone) updates.timezone = body.timezone;

    if (Object.keys(updates).length > 0) {
      const { data: updated } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select("id, email, first_name, last_name, phone, bio, language")
        .single();

      if (!updated) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
      }

      return NextResponse.json({
        user: {
          id: updated.id,
          email: updated.email,
          firstName: updated.first_name,
          lastName: updated.last_name,
          phone: updated.phone,
          bio: updated.bio,
          language: updated.language,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update user error");
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

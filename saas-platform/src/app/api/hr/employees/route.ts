import { NextResponse } from "next/server";
import { getCurrentUser, getActiveWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const workspace = await getActiveWorkspace();
    if (!workspace) return NextResponse.json({ error: "Aucun espace de travail" }, { status: 400 });

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");

    const supabase = await createClient();
    const orgId = workspace.organizationId;

    const { data: employees, count } = await supabase
      .from("employees")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId)
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      employees: employees || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const workspace = await getActiveWorkspace();
    if (!workspace) return NextResponse.json({ error: "Aucun espace de travail" }, { status: 400 });

    const supabase = await createClient();
    const body = await request.json();

    const { data: employee } = await supabase
      .from("employees")
      .insert({
        organization_id: workspace.organizationId,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        job_title: body.jobTitle,
        department: body.department,
        salary: body.salary || 0,
        status: body.status || "active",
      })
      .select()
      .single();

    return NextResponse.json({ employee });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

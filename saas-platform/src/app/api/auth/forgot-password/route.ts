import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const supabase = await createClient();

    // Supabase handles the password reset flow including sending the email
    // The redirect URL should point to our reset-password page
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://omnicore.cd";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/fr/reset-password`,
    });

    if (error) {
      console.error("Forgot password error:", error.message);
      // Don't reveal if the email exists or not (security best practice)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

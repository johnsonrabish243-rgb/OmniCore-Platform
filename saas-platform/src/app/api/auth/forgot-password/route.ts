import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { SignJWT } from "jose";
import { getResetJwtSecret } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Si cet email existe, un lien de réinitialisation a été envoyé." }, { status: 200 });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = await new SignJWT({ userId: user.id, type: "reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(getResetJwtSecret());

    // In production, send email with reset link
    // Reset token is NEVER returned in the API response — only used server-side
    // TODO: Integrate email service (SendGrid, Resend, etc.) to send the reset link

    return NextResponse.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

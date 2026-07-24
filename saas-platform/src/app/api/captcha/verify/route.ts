import { NextResponse } from "next/server";
import { verifyChallenge, captchaRateLimiter } from "@/lib/omnicaptcha";

/**
 * POST /api/captcha/verify
 * Verifies a user's answer against a captcha token.
 * Rate-limited to prevent brute-force attacks.
 */
export async function POST(request: Request) {
  try {
    const { token, answer } = await request.json();

    if (!token || !answer) {
      return NextResponse.json(
        { valid: false, error: "Token et réponse requis." },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    // Rate limit: max 10 verification attempts per minute per IP
    const rateCheck = captchaRateLimiter.check(`captcha:verify:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { valid: false, error: "Trop de tentatives. Réessayez dans une minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const result = verifyChallenge(token, answer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Captcha verify error");
    return NextResponse.json(
      { valid: false, error: "Erreur lors de la vérification." },
      { status: 500 }
    );
  }
}

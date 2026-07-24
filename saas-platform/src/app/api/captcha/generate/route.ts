import { NextResponse } from "next/server";
import { generateChallenge, captchaRateLimiter } from "@/lib/omnicaptcha";

/**
 * POST /api/captcha/generate
 * Generates a new OmniCaptcha challenge.
 * Rate-limited to prevent abuse.
 */
export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    // Rate limit: max 10 challenges per minute per IP
    const rateCheck = captchaRateLimiter.check(`captcha:gen:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { type, locale } = await request.json().catch(() => ({}));
    const challenge = generateChallenge(type || "math", locale || "fr");

    return NextResponse.json({
      id: challenge.id,
      type: challenge.type,
      question: challenge.question,
      token: challenge.token,
    });
  } catch (error) {
    console.error("Captcha generate error");
    return NextResponse.json(
      { error: "Erreur lors de la génération du captcha." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { generateChallenge, captchaRateLimiter } from "@/lib/omnicaptcha";

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    const rateCheck = captchaRateLimiter.check(`captcha:gen:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { locale } = await request.json().catch(() => ({}));
    const challenge = generateChallenge(undefined, locale || "fr");

    return NextResponse.json({
      id: challenge.id,
      type: challenge.type,
      question: challenge.question,
      data: challenge.data,
      token: challenge.token,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate captcha." },
      { status: 500 }
    );
  }
}

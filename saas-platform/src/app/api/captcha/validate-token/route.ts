import { NextResponse } from "next/server";
import { isTokenRecentlyUsed, captchaRateLimiter } from "@/lib/omnicaptcha";

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    const rateCheck = captchaRateLimiter.check(`captcha:session:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ valid: false }, { status: 429 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    return NextResponse.json({ valid: isTokenRecentlyUsed(token) });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

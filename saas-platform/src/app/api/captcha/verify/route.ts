import { NextResponse } from "next/server";
import { verifyChallenge, captchaRateLimiter } from "@/lib/omnicaptcha";

export async function POST(request: Request) {
  try {
    const csrfHeader = request.headers.get("x-requested-with");
    if (csrfHeader !== "XMLHttpRequest") {
      return NextResponse.json(
        { valid: false, error: "CSRF validation failed." },
        { status: 403 }
      );
    }

    const { token, answer } = await request.json();

    if (!token || !answer) {
      return NextResponse.json(
        { valid: false, error: "Token and answer are required." },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    const rateCheck = captchaRateLimiter.check(`captcha:verify:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { valid: false, error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const result = verifyChallenge(token, answer);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Verification failed." },
      { status: 500 }
    );
  }
}

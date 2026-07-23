/**
 * OmniCaptcha — Proprietary Security Captcha System
 *
 * A self-hosted, privacy-first alternative to reCAPTCHA/hCaptcha.
 *
 * Features:
 * - Multiple challenge types: math, word-math, count-shapes
 * - Signed & time-limited tokens (server-side verification, HMAC SHA-256)
 * - Anti-bot / anti-bruteforce / anti-script protections
 * - In-memory rate limiting
 * - No third-party tracking, no cookies, GDPR compliant
 */

import { createHmac, randomInt, timingSafeEqual } from "crypto";

const SECRET = process.env.OMNICAPTCHA_SECRET || process.env.INSFORGE_API_KEY || "omnidefault-dev-key-change-in-prod";
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

/* ─── Challenge Types ─── */

export type ChallengeType = "math" | "math-basic" | "word-math" | "count-shapes";

export interface CaptchaChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  hint?: string;
  token: string; // signed token for verification
}

export interface CaptchaVerifyResult {
  valid: boolean;
  reason?: string;
}

/* ─── Internal Helpers ─── */

function generateId(): string {
  return randomInt(100000, 999999).toString();
}

function signPayload(payload: string): string {
  const hmac = createHmac("sha256", SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

function createToken(challengeId: string, answer: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const raw = `${challengeId}:${answer}:${expiresAt}`;
  const sig = signPayload(raw);
  return Buffer.from(`${raw}:${sig}`).toString("base64url");
}

function parseToken(token: string): { challengeId: string; answer: string; expiresAt: number; sig: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;
    return {
      challengeId: parts[0],
      answer: parts[1],
      expiresAt: parseInt(parts[2], 10),
      sig: parts[3],
    };
  } catch {
    return null;
  }
}

function verifyTokenSignature(challengeId: string, answer: string, expiresAt: number, sig: string): boolean {
  const raw = `${challengeId}:${answer}:${expiresAt}`;
  const expectedSig = signPayload(raw);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/* ─── Challenge Generators ─── */

const NUMBER_WORDS_FR: Record<number, string> = {
  1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq",
  6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
};

function generateMathChallenge(): { question: string; answer: string } {
  const a = randomInt(1, 50);
  const b = randomInt(1, 50);
  const ops = ["+", "-", "*"] as const;
  const op = ops[randomInt(0, ops.length)];

  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    case "*": answer = a * b; break;
    default: answer = a + b;
  }

  return {
    question: `Combien font ${a} ${op} ${b} ?`,
    answer: answer.toString(),
  };
}

function generateBasicMathChallenge(): { question: string; answer: string } {
  const a = randomInt(1, 20);
  const b = randomInt(1, 20);
  const ops = ["+", "-"] as const;
  const op = ops[randomInt(0, ops.length)];

  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    default: answer = a + b;
  }

  return {
    question: `${a} ${op} ${b} = ?`,
    answer: answer.toString(),
  };
}

function generateWordMathChallenge(): { question: string; answer: string; hint?: string } {
  const a = randomInt(1, 15);
  const b = randomInt(1, 15);
  const ops = ["+", "-"] as const;
  const op = ops[randomInt(0, ops.length)];

  const numberWords = NUMBER_WORDS_FR;
  const aWord = numberWords[a] || a.toString();
  const bWord = numberWords[b] || b.toString();
  const opWord = op === "+" ? "plus" : "moins";

  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    default: answer = a + b;
  }

  return {
    question: `Écrivez en chiffres : ${aWord} ${opWord} ${bWord}`,
    hint: `(ex: ${a} ${op} ${b} = ...)`,
    answer: answer.toString(),
  };
}

function generateCountShapesChallenge(): { question: string; answer: string; hint?: string } {
  const shapeCount = randomInt(3, 12);
  const shapes = ["⬤", "■", "▲", "★", "◆"];
  const shape = shapes[randomInt(0, shapes.length)];
  const shapeName = shape === "⬤" ? "cercles" : shape === "■" ? "carrés" : shape === "▲" ? "triangles" : shape === "★" ? "étoiles" : "losanges";

  return {
    question: `Combien de ${shapeName} voyez-vous ? ${shape.repeat(shapeCount)}`,
    hint: `Comptez les symboles ${shape}`,
    answer: shapeCount.toString(),
  };
}

/* ─── Public API ─── */

/**
 * Generate a new captcha challenge.
 * Returns the challenge (question + signed token) to display to the user.
 * The token must be sent back with the user's answer for verification.
 */
export function generateChallenge(type: ChallengeType = "math"): CaptchaChallenge {
  let challenge: { question: string; answer: string; hint?: string };

  switch (type) {
    case "math":
      challenge = generateMathChallenge();
      break;
    case "math-basic":
      challenge = generateBasicMathChallenge();
      break;
    case "word-math":
      challenge = generateWordMathChallenge();
      break;
    case "count-shapes":
      challenge = generateCountShapesChallenge();
      break;
    default:
      challenge = generateMathChallenge();
  }

  const id = generateId();
  const token = createToken(id, challenge.answer);

  return {
    id,
    type,
    question: challenge.question,
    hint: challenge.hint,
    token,
  };
}

/**
 * Verify a user's answer against a captcha token.
 * Validates: token signature, expiration, and answer correctness.
 */
export function verifyChallenge(token: string, userAnswer: string): CaptchaVerifyResult {
  const parsed = parseToken(token);
  if (!parsed) {
    return { valid: false, reason: "Invalid token format" };
  }

  // Check expiration
  if (Date.now() > parsed.expiresAt) {
    return { valid: false, reason: "Token expired" };
  }

  // Verify signature
  if (!verifyTokenSignature(parsed.challengeId, parsed.answer, parsed.expiresAt, parsed.sig)) {
    return { valid: false, reason: "Invalid token signature" };
  }

  // Check answer (case-insensitive trim)
  const normalizedAnswer = userAnswer.trim().toLowerCase();
  const expectedAnswer = parsed.answer.trim().toLowerCase();

  if (normalizedAnswer !== expectedAnswer) {
    return { valid: false, reason: "Incorrect answer" };
  }

  return { valid: true };
}

/**
 * Rate-limiting helper: simple in-memory store.
 * Note: For multi-instance deployments (e.g., Vercel), use Redis or the database for distributed rate limiting.
 */
export class MemoryRateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60_000 // 1 minute
  ) {}

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxAttempts - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxAttempts - entry.count, resetAt: entry.resetAt };
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

// Singleton rate limiters for captcha endpoints
export const captchaRateLimiter = new MemoryRateLimiter(10, 60_000);

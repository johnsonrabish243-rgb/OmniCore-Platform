import { createHmac, randomInt, randomBytes, timingSafeEqual } from "crypto";

const SECRET: string = process.env.OMNICAPTCHA_SECRET || process.env.INSFORGE_API_KEY || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("OMNICAPTCHA_SECRET is required in production");
  }
  return ""; // dev only
})();

const TOKEN_TTL_MS = 5 * 60 * 1000;

export type ChallengeType = "math" | "math-basic" | "word-math" | "count-shapes";

export type ChallengeLocale = "fr" | "en" | "sw";

export interface CaptchaChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  hint?: string;
  token: string;
  locale: ChallengeLocale;
}

export interface CaptchaVerifyResult {
  valid: boolean;
  reason?: string;
}

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

function generateMathChallenge(locale: ChallengeLocale): { question: string; answer: string } {
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

  const templates: Record<ChallengeLocale, string> = {
    fr: `Combien font ${a} ${op} ${b} ?`,
    en: `What is ${a} ${op} ${b} ?`,
    sw: `${a} ${op} ${b} ni ngapi ?`,
  };

  return { question: templates[locale], answer: answer.toString() };
}

function generateBasicMathChallenge(locale: ChallengeLocale): { question: string; answer: string } {
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

  return { question: `${a} ${op} ${b} = ?`, answer: answer.toString() };
}

const NUMBER_WORDS_FR: Record<number, string> = {
  1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq",
  6: "six", 7: "sept", 8: "huit", 9: "neuf", 10: "dix",
};

const NUMBER_WORDS_EN: Record<number, string> = {
  1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
  6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
};

const NUMBER_WORDS_SW: Record<number, string> = {
  1: "moja", 2: "mbili", 3: "tatu", 4: "nne", 5: "tano",
  6: "sita", 7: "saba", 8: "nane", 9: "tisa", 10: "kumi",
};

function getNumberWords(locale: ChallengeLocale): Record<number, string> {
  switch (locale) {
    case "fr": return NUMBER_WORDS_FR;
    case "sw": return NUMBER_WORDS_SW;
    default: return NUMBER_WORDS_EN;
  }
}

function generateWordMathChallenge(locale: ChallengeLocale): { question: string; answer: string; hint?: string } {
  const a = randomInt(1, 15);
  const b = randomInt(1, 15);
  const ops = ["+", "-"] as const;
  const op = ops[randomInt(0, ops.length)];

  const numberWords = getNumberWords(locale);
  const aWord = numberWords[a] || a.toString();
  const bWord = numberWords[b] || b.toString();

  const opWords: Record<ChallengeLocale, Record<string, string>> = {
    fr: { "+": "plus", "-": "moins" },
    en: { "+": "plus", "-": "minus" },
    sw: { "+": "jumlisha", "-": "toa" },
  };

  const opWord = opWords[locale][op] || op;

  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    default: answer = a + b;
  }

  const templates: Record<ChallengeLocale, string> = {
    fr: `Écrivez en chiffres : ${aWord} ${opWord} ${bWord}`,
    en: `Write in numbers: ${aWord} ${opWord} ${bWord}`,
    sw: `Andika kwa nambari: ${aWord} ${opWord} ${bWord}`,
  };

  return {
    question: templates[locale],
    hint: `(ex: ${a} ${op} ${b} = ...)`,
    answer: answer.toString(),
  };
}

function generateCountShapesChallenge(locale: ChallengeLocale): { question: string; answer: string; hint?: string } {
  const shapeCount = randomInt(3, 12);
  const shapes = ["⬤", "■", "▲", "★", "◆"];
  const shape = shapes[randomInt(0, shapes.length)];

  const shapeNames: Record<ChallengeLocale, Record<string, string>> = {
    fr: { "⬤": "cercles", "■": "carrés", "▲": "triangles", "★": "étoiles", "◆": "losanges" },
    en: { "⬤": "circles", "■": "squares", "▲": "triangles", "★": "stars", "◆": "diamonds" },
    sw: { "⬤": "miduara", "■": "mraba", "▲": "pembetatu", "★": "nyota", "◆": "almasi" },
  };

  const shapeName = shapeNames[locale][shape] || shape;

  const templates: Record<ChallengeLocale, string> = {
    fr: `Combien de ${shapeName} voyez-vous ? ${shape.repeat(Math.min(shapeCount, 20))}`,
    en: `How many ${shapeName} do you see? ${shape.repeat(Math.min(shapeCount, 20))}`,
    sw: `Unaona ${shapeName} ngapi? ${shape.repeat(Math.min(shapeCount, 20))}`,
  };

  return {
    question: templates[locale],
    hint: `Comptez les symboles ${shape}`,
    answer: shapeCount.toString(),
  };
}

export function generateChallenge(type: ChallengeType = "math", locale: ChallengeLocale = "fr"): CaptchaChallenge {
  let challenge: { question: string; answer: string; hint?: string };

  switch (type) {
    case "math": challenge = generateMathChallenge(locale); break;
    case "math-basic": challenge = generateBasicMathChallenge(locale); break;
    case "word-math": challenge = generateWordMathChallenge(locale); break;
    case "count-shapes": challenge = generateCountShapesChallenge(locale); break;
    default: challenge = generateMathChallenge(locale);
  }

  const id = generateId();
  const token = createToken(id, challenge.answer);

  return { id, type, question: challenge.question, hint: challenge.hint, token, locale };
}

export function verifyChallenge(token: string, userAnswer: string): CaptchaVerifyResult {
  const parsed = parseToken(token);
  if (!parsed) return { valid: false, reason: "Invalid token format" };

  if (Date.now() > parsed.expiresAt) return { valid: false, reason: "Token expired" };

  if (!verifyTokenSignature(parsed.challengeId, parsed.answer, parsed.expiresAt, parsed.sig)) {
    return { valid: false, reason: "Invalid token signature" };
  }

  const normalizedAnswer = userAnswer.trim().toLowerCase();
  const expectedAnswer = parsed.answer.trim().toLowerCase();

  if (normalizedAnswer !== expectedAnswer) return { valid: false, reason: "Incorrect answer" };

  return { valid: true };
}

export class MemoryRateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60_000
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

  reset(key: string): void { this.store.delete(key); }
}

export const captchaRateLimiter = new MemoryRateLimiter(10, 60_000);

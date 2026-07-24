import { createHmac, randomInt, randomBytes, timingSafeEqual } from "crypto";

const SECRET: string = process.env.OMNICAPTCHA_SECRET || process.env.INSFORGE_API_KEY || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("OMNICAPTCHA_SECRET is required in production");
  }
  return "dev-secret-do-not-use-in-prod";
})();

const TOKEN_TTL_MS = 5 * 60 * 1000;

export type ChallengeType = "icon-match" | "image-select" | "puzzle-grid" | "find-missing";
export type ChallengeLocale = "fr" | "en" | "sw";

export interface CaptchaChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  data: ChallengeData;
  token: string;
  locale: ChallengeLocale;
}

export type ChallengeData = IconMatchData | ImageSelectData | PuzzleGridData | FindMissingData;

export interface IconMatchData {
  type: "icon-match";
  emoji: string;
  options: { id: number; emoji: string }[];
  correctId: number;
  description: string;
}

export interface ImageSelectData {
  type: "image-select";
  grid: { id: number; emoji: string }[];
  targetIds: number[];
  description: string;
}

export interface PuzzleGridData {
  type: "puzzle-grid";
  grid: { id: number; emoji: string }[];
  correctId: number;
  description: string;
}

export interface FindMissingData {
  type: "find-missing";
  emojis: string[];
  options: { id: number; emoji: string }[];
  correctId: number;
  description: string;
}

export interface CaptchaVerifyResult {
  valid: boolean;
  reason?: string;
}

const usedTokens = new Map<string, number>();
const CLEANUP_MS = 10 * 60 * 1000;
setInterval(() => { usedTokens.clear(); }, CLEANUP_MS);

function generateId(): string { return randomBytes(16).toString("hex"); }

function signPayload(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function createToken(challengeId: string, answer: string): string {
  const nonce = randomBytes(8).toString("hex");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const raw = `${challengeId}:${answer}:${expiresAt}:${nonce}`;
  return Buffer.from(`${raw}:${signPayload(raw)}`).toString("base64url");
}

function parseToken(token: string): { challengeId: string; answer: string; expiresAt: number; nonce: string; sig: string } | null {
  try {
    const parts = Buffer.from(token, "base64url").toString("utf-8").split(":");
    if (parts.length !== 5) return null;
    return { challengeId: parts[0], answer: parts[1], expiresAt: parseInt(parts[2], 10), nonce: parts[3], sig: parts[4] };
  } catch { return null; }
}

function validSig(challengeId: string, answer: string, expiresAt: number, nonce: string, sig: string): boolean {
  const expected = signPayload(`${challengeId}:${answer}:${expiresAt}:${nonce}`);
  try { return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex")); } catch { return false; }
}

const EMOJIS = ["🌍", "🚀", "⭐", "🌈", "🔥", "💎", "🎯", "🏆", "🌸", "🍀", "🦋", "🌺", "🍎", "🍀", "🎲", "🎨"];

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = randomInt(0, copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateIconMatch(locale: ChallengeLocale): { data: IconMatchData; answer: string } {
  const target = pick(EMOJIS, 1)[0];
  const others = pick(EMOJIS.filter(e => e !== target), 3);
  const options = shuffle([target, ...others]).map((e, i) => ({ id: i + 1, emoji: e }));
  const correct = options.find(o => o.emoji === target)!.id;

  const labels: Record<ChallengeLocale, string> = {
    fr: `Appuyez sur ${target}`,
    en: `Tap ${target}`,
    sw: `Gusa ${target}`,
  };

  return { data: { type: "icon-match", emoji: target, options, correctId: correct, description: labels[locale] }, answer: correct.toString() };
}

function generateImageSelect(locale: ChallengeLocale): { data: ImageSelectData; answer: string } {
  const chosen = pick(EMOJIS, 6);
  const grid = chosen.map((e, i) => ({ id: i + 1, emoji: e }));
  const targetCount = randomInt(2, 3);
  const targets = pick(grid, targetCount);
  const targetEmoji = targets[0].emoji;

  const labels: Record<ChallengeLocale, string> = {
    fr: `Sélectionnez tous les ${targetEmoji}`,
    en: `Select all ${targetEmoji}`,
    sw: `Chagua vyote ${targetEmoji}`,
  };

  return {
    data: { type: "image-select", grid, targetIds: targets.map(t => t.id).sort(), description: labels[locale] },
    answer: targets.map(t => t.id).sort().join(","),
  };
}

function generatePuzzleGrid(locale: ChallengeLocale): { data: PuzzleGridData; answer: string } {
  const base = pick(EMOJIS, 1)[0];
  const diff = pick(EMOJIS.filter(s => s !== base), 1)[0];
  const cells: { id: number; emoji: string }[] = [];
  for (let i = 0; i < 9; i++) cells.push({ id: i + 1, emoji: i === randomInt(0, 9) ? diff : base });
  const shuffled = shuffle(cells);
  const correct = shuffled.find(c => c.emoji === diff)!.id;

  const labels: Record<ChallengeLocale, string> = {
    fr: "Trouvez l'élément différent",
    en: "Find the odd one out",
    sw: "Tafuta kisicholingana",
  };

  return { data: { type: "puzzle-grid", grid: shuffled, correctId: correct, description: labels[locale] }, answer: correct.toString() };
}

function generateFindMissing(locale: ChallengeLocale): { data: FindMissingData; answer: string } {
  const all = pick(EMOJIS, 5);
  const missing = all[0];
  const shown = shuffle(all.slice(1));
  const otherOptions = pick(EMOJIS.filter(e => !all.includes(e)), 3);
  const options = shuffle([missing, ...otherOptions]).map((e, i) => ({ id: i + 1, emoji: e }));
  const correct = options.find(o => o.emoji === missing)!.id;

  const labels: Record<ChallengeLocale, string> = {
    fr: "Quel élément manque ?",
    en: "What is missing?",
    sw: "Nini kinakosekana?",
  };

  return { data: { type: "find-missing", emojis: shown, options, correctId: correct, description: labels[locale] }, answer: correct.toString() };
}

function randomType(): ChallengeType {
  const types: ChallengeType[] = ["icon-match", "image-select", "puzzle-grid", "find-missing"];
  return types[randomInt(0, types.length)];
}

export function generateChallenge(type?: ChallengeType, locale: ChallengeLocale = "fr"): CaptchaChallenge {
  const t = type || randomType();
  const id = generateId();
  let result: { data: ChallengeData; answer: string };
  switch (t) {
    case "icon-match": result = generateIconMatch(locale); break;
    case "image-select": result = generateImageSelect(locale); break;
    case "puzzle-grid": result = generatePuzzleGrid(locale); break;
    case "find-missing": result = generateFindMissing(locale); break;
  }

  const q = "question" in result.data
    ? (result.data as any).question || (result.data as any).description || ""
    : (result.data as any).description || "";

  return { id, type: t, question: q, data: result.data, token: createToken(id, result.answer), locale };
}

export function verifyChallenge(token: string, userAnswer: string): CaptchaVerifyResult {
  const p = parseToken(token);
  if (!p) return { valid: false, reason: "Invalid token format" };
  if (Date.now() > p.expiresAt) return { valid: false, reason: "Token expired" };
  if (usedTokens.has(token)) return { valid: false, reason: "Token already used" };
  if (!validSig(p.challengeId, p.answer, p.expiresAt, p.nonce, p.sig)) return { valid: false, reason: "Invalid signature" };
  if (userAnswer.trim().toLowerCase() !== p.answer.trim().toLowerCase()) return { valid: false, reason: "Incorrect" };
  usedTokens.set(token, Date.now());
  return { valid: true };
}

export function isTokenUsed(token: string): boolean { return usedTokens.has(token); }

export function isTokenRecentlyUsed(token: string, maxAgeMs: number = TOKEN_TTL_MS): boolean {
  const ts = usedTokens.get(token);
  if (!ts) return false;
  return (Date.now() - ts) < maxAgeMs;
}

export class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();
  constructor(private max: number = 5, private windowMs: number = 60_000) {}
  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const e = this.store.get(key);
    if (!e || now > e.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1, resetAt: now + this.windowMs };
    }
    if (e.count >= this.max) return { allowed: false, remaining: 0, resetAt: e.resetAt };
    e.count++;
    return { allowed: true, remaining: this.max - e.count, resetAt: e.resetAt };
  }
  reset(key: string) { this.store.delete(key); }
}

export const captchaRateLimiter = new MemoryRateLimiter(10, 60_000);
export const sensitiveRateLimiter = new MemoryRateLimiter(3, 60_000);

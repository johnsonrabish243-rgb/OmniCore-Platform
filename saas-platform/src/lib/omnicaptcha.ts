import { createHmac, randomInt, randomBytes, timingSafeEqual } from "crypto";

const SECRET: string = process.env.OMNICAPTCHA_SECRET || process.env.INSFORGE_API_KEY || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("OMNICAPTCHA_SECRET is required in production");
  }
  return "dev-secret-do-not-use-in-prod";
})();

const TOKEN_TTL_MS = 5 * 60 * 1000;

export type ChallengeType = "checkbox" | "image-select" | "puzzle-grid" | "math";
export type ChallengeLocale = "fr" | "en" | "sw";

export interface CaptchaChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  data: ChallengeData;
  token: string;
  locale: ChallengeLocale;
}

export type ChallengeData = CheckboxData | ImageSelectData | PuzzleGridData | MathData;

export interface CheckboxData {
  type: "checkbox";
  label: string;
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

export interface MathData {
  type: "math";
  question: string;
}

export interface CaptchaVerifyResult {
  valid: boolean;
  reason?: string;
}

let usedTokens = new Set<string>();
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

const SHAPES = ["⬤", "■", "▲", "★", "◆", "⬟", "⬢"];

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

const L_FR: Record<string, string> = { "⬤": "cercle", "■": "carré", "▲": "triangle", "★": "étoile", "◆": "losange", "⬟": "pentagone", "⬢": "hexagone" };
const L_EN: Record<string, string> = { "⬤": "circle", "■": "square", "▲": "triangle", "★": "star", "◆": "diamond", "⬟": "pentagon", "⬢": "hexagon" };
const L_SW: Record<string, string> = { "⬤": "duara", "■": "mraba", "▲": "pembetatu", "★": "nyota", "◆": "almasi", "⬟": "pentagoni", "⬢": "heksagoni" };

function shapeLabel(s: string, l: ChallengeLocale): string {
  const m = { fr: L_FR, en: L_EN, sw: L_SW }[l];
  return m?.[s] || s;
}

function generateCheckbox(locale: ChallengeLocale): { data: CheckboxData; answer: string } {
  const labels: Record<ChallengeLocale, string> = {
    fr: "Cochez pour confirmer que vous êtes humain",
    en: "Check to confirm you are human",
    sw: "Weka alama ili kuthibitisha wewe ni binadamu",
  };
  return { data: { type: "checkbox", label: labels[locale] }, answer: "confirmed" };
}

function generateImageSelect(locale: ChallengeLocale): { data: ImageSelectData; answer: string } {
  const emojis = ["🌍", "🚀", "⭐", "🌈", "🔥", "💎", "🎯", "🏆", "🌸", "🍀", "🦋", "🌺"];
  const chosen = pick(emojis, 6);
  const grid = chosen.map((e, i) => ({ id: i + 1, emoji: e }));
  const targetCount = randomInt(2, 3);
  const targets = pick(grid, targetCount);
  const targetEmoji = targets[0].emoji;

  const labels: Record<ChallengeLocale, string> = {
    fr: `Sélectionnez tous les éléments avec ${targetEmoji}`,
    en: `Select all items with ${targetEmoji}`,
    sw: `Chagua vitu vyote vilivyo na ${targetEmoji}`,
  };

  return {
    data: { type: "image-select", grid, targetIds: targets.map(t => t.id).sort(), description: labels[locale] },
    answer: targets.map(t => t.id).sort().join(","),
  };
}

function generatePuzzleGrid(locale: ChallengeLocale): { data: PuzzleGridData; answer: string } {
  const base = pick(SHAPES, 1)[0];
  const diff = pick(SHAPES.filter(s => s !== base), 1)[0];
  const pos = randomInt(0, 8);
  const cells: { id: number; emoji: string }[] = [];
  for (let i = 0; i < 9; i++) cells.push({ id: i + 1, emoji: i === pos ? diff : base });
  const shuffled = shuffle(cells);
  const correct = shuffled.find(c => c.emoji === diff)!.id;

  const labels: Record<ChallengeLocale, string> = {
    fr: "Trouvez l'élément différent",
    en: "Find the odd one out",
    sw: "Tafuta kisicholingana",
  };

  return { data: { type: "puzzle-grid", grid: shuffled, correctId: correct, description: labels[locale] }, answer: correct.toString() };
}

function generateMath(locale: ChallengeLocale): { data: MathData; answer: string } {
  const a = randomInt(10, 50);
  const b = randomInt(1, 20);
  const op = ["+", "-"][randomInt(0, 2)];
  const ans = op === "+" ? a + b : a - b;

  const labels: Record<ChallengeLocale, string> = {
    fr: `Combien font ${a} ${op} ${b} ?`,
    en: `What is ${a} ${op} ${b} ?`,
    sw: `${a} ${op} ${b} ni ngapi ?`,
  };

  return { data: { type: "math", question: labels[locale] }, answer: ans.toString() };
}

function randomType(): ChallengeType {
  return (["checkbox", "image-select", "puzzle-grid", "math"] as ChallengeType[])[randomInt(0, 4)];
}

export function generateChallenge(type?: ChallengeType, locale: ChallengeLocale = "fr"): CaptchaChallenge {
  const t = type || randomType();
  const id = generateId();
  let result: { data: ChallengeData; answer: string };
  switch (t) {
    case "checkbox": result = generateCheckbox(locale); break;
    case "image-select": result = generateImageSelect(locale); break;
    case "puzzle-grid": result = generatePuzzleGrid(locale); break;
    case "math": result = generateMath(locale); break;
    default: result = generateCheckbox(locale);
  }

  let q = "";
  if (result.data.type === "checkbox") q = result.data.label;
  else if (result.data.type === "image-select") q = result.data.description;
  else if (result.data.type === "puzzle-grid") q = result.data.description;
  else if (result.data.type === "math") q = result.data.question;

  return { id, type: t, question: q, data: result.data, token: createToken(id, result.answer), locale };
}

export function verifyChallenge(token: string, userAnswer: string): CaptchaVerifyResult {
  const p = parseToken(token);
  if (!p) return { valid: false, reason: "Invalid token format" };
  if (Date.now() > p.expiresAt) return { valid: false, reason: "Token expired" };
  if (usedTokens.has(token)) return { valid: false, reason: "Token already used" };
  if (!validSig(p.challengeId, p.answer, p.expiresAt, p.nonce, p.sig)) return { valid: false, reason: "Invalid signature" };
  if (userAnswer.trim().toLowerCase() !== p.answer.trim().toLowerCase()) return { valid: false, reason: "Incorrect" };
  usedTokens.add(token);
  return { valid: true };
}

export function isTokenUsed(token: string): boolean { return usedTokens.has(token); }

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

import { createHmac, randomInt, randomBytes, timingSafeEqual } from "crypto";

const SECRET: string = process.env.OMNICAPTCHA_SECRET || process.env.INSFORGE_API_KEY || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("OMNICAPTCHA_SECRET is required in production");
  }
  return "dev-secret-do-not-use-in-prod";
})();

const TOKEN_TTL_MS = 5 * 60 * 1000;

export type ChallengeType =
  | "puzzle-slider"
  | "shape-select"
  | "drag-order"
  | "rotation"
  | "click-match"
  | "pattern-complete"
  | "puzzle-grid"
  | "math"
  | "count-shapes";

export type ChallengeLocale = "fr" | "en" | "sw";

export interface CaptchaChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  data: ChallengeData;
  token: string;
  locale: ChallengeLocale;
}

export type ChallengeData =
  | SliderData
  | ShapeSelectData
  | DragOrderData
  | RotationData
  | ClickMatchData
  | PatternCompleteData
  | PuzzleGridData
  | MathData
  | CountShapesData;

export interface SliderData {
  type: "puzzle-slider";
  emoji: string;
  label: string;
}

export interface ShapeSelectData {
  type: "shape-select";
  grid: GridCell[];
  description: string;
}

export interface DragOrderData {
  type: "drag-order";
  items: DragItem[];
  description: string;
}

export interface RotationData {
  type: "rotation";
  emoji: string;
  directionLabel: string;
}

export interface ClickMatchData {
  type: "click-match";
  grid: MatchCell[];
}

export interface PatternCompleteData {
  type: "pattern-complete";
  sequence: string[];
  options: string[];
}

export interface PuzzleGridData {
  type: "puzzle-grid";
  grid: GridCell[];
  description: string;
}

export interface MathData {
  type: "math";
  question: string;
}

export interface CountShapesData {
  type: "count-shapes";
  emoji: string;
  count: number;
  question: string;
}

export interface GridCell {
  id: number;
  emoji: string;
}

export interface DragItem {
  id: number;
  label: string;
}

export interface MatchCell {
  id: number;
  pairId: number;
  emoji: string;
}

export interface CaptchaVerifyResult {
  valid: boolean;
  reason?: string;
}

let usedTokens = new Set<string>();
const USED_TOKEN_CLEANUP_INTERVAL = 10 * 60 * 1000;

setInterval(() => { usedTokens.clear(); }, USED_TOKEN_CLEANUP_INTERVAL);

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function signPayload(payload: string): string {
  const hmac = createHmac("sha256", SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

function createToken(challengeId: string, answer: string): string {
  const nonce = randomBytes(8).toString("hex");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const raw = `${challengeId}:${answer}:${expiresAt}:${nonce}`;
  const sig = signPayload(raw);
  return Buffer.from(`${raw}:${sig}`).toString("base64url");
}

function parseToken(token: string): { challengeId: string; answer: string; expiresAt: number; nonce: string; sig: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 5) return null;
    return {
      challengeId: parts[0],
      answer: parts[1],
      expiresAt: parseInt(parts[2], 10),
      nonce: parts[3],
      sig: parts[4],
    };
  } catch {
    return null;
  }
}

function verifyTokenSignature(challengeId: string, answer: string, expiresAt: number, nonce: string, sig: string): boolean {
  const raw = `${challengeId}:${answer}:${expiresAt}:${nonce}`;
  const expectedSig = signPayload(raw);
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
  } catch {
    return false;
  }
}

const SHAPES = ["⬤", "■", "▲", "★", "◆", "⬟", "⬢", "⬥", "⬦"];
const EMOJIS = ["🌍", "🚀", "⭐", "🌈", "🔥", "💎", "🎯", "🏆", "🌸", "🍀", "🦋", "🌺"];

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = randomInt(0, copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

const SHAPE_NAMES_FR: Record<string, string> = { "⬤": "cercle", "■": "carré", "▲": "triangle", "★": "étoile", "◆": "losange", "⬟": "pentagone", "⬢": "hexagone", "⬥": "carré", "⬦": "losange" };
const SHAPE_NAMES_EN: Record<string, string> = { "⬤": "circle", "■": "square", "▲": "triangle", "★": "star", "◆": "diamond", "⬟": "pentagon", "⬢": "hexagon", "⬥": "square", "⬦": "diamond" };
const SHAPE_NAMES_SW: Record<string, string> = { "⬤": "duara", "■": "mraba", "▲": "pembetatu", "★": "nyota", "◆": "almasi", "⬟": "pentagoni", "⬢": "heksagoni", "⬥": "mraba", "⬦": "almasi" };

function shapeName(shape: string, locale: ChallengeLocale): string {
  switch (locale) {
    case "fr": return SHAPE_NAMES_FR[shape] || shape;
    case "sw": return SHAPE_NAMES_SW[shape] || shape;
    default: return SHAPE_NAMES_EN[shape] || shape;
  }
}

function shuffle<T>(arr: T[]): { items: T[]; order: number[] } {
  const indices = arr.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return { items: indices.map(i => arr[i]), order: indices };
}

/* ─── Challenge Generators ─── */

function generatePuzzleSlider(locale: ChallengeLocale): { data: SliderData; answer: string } {
  const emoji = pick(EMOJIS, 1)[0];
  const target = (randomInt(20, 80)).toString();
  const templates: Record<ChallengeLocale, string> = {
    fr: "Positionnez le curseur au bon endroit",
    en: "Move the slider to the correct position",
    sw: "Sogeza kitelezi hadi mahali sahihi",
  };
  return {
    data: { type: "puzzle-slider", emoji, label: templates[locale] },
    answer: target,
  };
}

function generateShapeSelect(locale: ChallengeLocale): { data: ShapeSelectData; answer: string } {
  const shapes = pick(SHAPES, 9);
  const grid: GridCell[] = shapes.map((emoji, i) => ({ id: i + 1, emoji }));
  const targetCount = randomInt(2, 4);
  const targetCells = pick(grid, targetCount);
  const targetShape = targetCells[0].emoji;
  const name = shapeName(targetShape, locale);

  const templates: Record<ChallengeLocale, string> = {
    fr: `Sélectionnez tous les ${name}`,
    en: `Select all the ${name}s`,
    sw: `Chagua ${name} zote`,
  };

  const answer = targetCells.map(c => c.id).sort((a, b) => a - b).join(",");
  return { data: { type: "shape-select", grid, description: templates[locale] }, answer };
}

function generateDragOrder(locale: ChallengeLocale): { data: DragOrderData; answer: string } {
  const animals: Record<ChallengeLocale, string[]> = {
    fr: ["Soleil", "Lune", "Étoile", "Terre"],
    en: ["Sun", "Moon", "Star", "Earth"],
    sw: ["Jua", "Mwezi", "Nyota", "Dunia"],
  };
  const labels = animals[locale];
  const items: DragItem[] = labels.map((label, i) => ({ id: i + 1, label }));
  const { items: shuffled, order } = shuffle(items);

  const templates: Record<ChallengeLocale, string> = {
    fr: "Classez du plus petit au plus grand",
    en: "Sort from smallest to largest",
    sw: "Panga kutoka ndogo hadi kubwa",
  };

  const answer = items.map(i => i.id).join(",");
  return { data: { type: "drag-order", items: shuffled, description: templates[locale] }, answer };
}

function generateRotation(locale: ChallengeLocale): { data: RotationData; answer: string } {
  const targetAngle = randomInt(0, 359);
  const emoji = pick(SHAPES, 1)[0];

  const templates: Record<ChallengeLocale, string> = {
    fr: "Faites pivoter jusqu'à ce que ce soit droit",
    en: "Rotate until straight",
    sw: "Zungusha hadi iwe sawa",
  };

  return { data: { type: "rotation", emoji, directionLabel: templates[locale] }, answer: targetAngle.toString() };
}

function generateClickMatch(locale: ChallengeLocale): { data: ClickMatchData; answer: string } {
  const pairs = [
    ["🌍", "🌏"], ["🚀", "🛸"], ["⭐", "🌟"],
    ["🌈", "🌤️"], ["🔥", "💥"], ["💎", "💠"],
    ["🎯", "🎳"], ["🏆", "🥇"], ["🌸", "🌺"],
  ];
  const selectedPairs = pick(pairs, 3);
  const grid: MatchCell[] = [];
  selectedPairs.forEach((pair, pairIdx) => {
    grid.push({ id: grid.length + 1, pairId: pairIdx, emoji: pair[0] });
    grid.push({ id: grid.length + 1, pairId: pairIdx, emoji: pair[1] });
  });
  const { items: shuffledGrid } = shuffle(grid);

  const templates: Record<ChallengeLocale, string> = {
    fr: "Trouvez les paires qui correspondent",
    en: "Find the matching pairs",
    sw: "Tafuta jozi zinazolingana",
  };

  const answer = shuffledGrid.map(c => c.pairId).join(",");
  return { data: { type: "click-match", grid: shuffledGrid }, answer };
}

function generatePatternComplete(locale: ChallengeLocale): { data: PatternCompleteData; answer: string } {
  const emojiOptions = ["🌍", "🚀", "⭐", "🌈", "🔥", "💎"];
  const seqLen = randomInt(3, 4);
  const sequence: string[] = [];
  for (let i = 0; i < seqLen; i++) {
    sequence.push(emojiOptions[randomInt(0, emojiOptions.length)]);
  }
  const correctNext = emojiOptions[randomInt(0, emojiOptions.length)];
  const wrongOptions = pick(emojiOptions.filter(e => e !== correctNext), 3);
  const options = [...wrongOptions, correctNext];
  const { items: shuffledOptions, order } = shuffle(options);
  const correctIndex = order.indexOf(options.length - 1);

  const templates: Record<ChallengeLocale, string> = {
    fr: "Quel est le prochain élément de la séquence ?",
    en: "What is the next item in the sequence?",
    sw: "Ni kipengele gani kinachofuata katika mlolongo?",
  };

  const answer = correctIndex.toString();
  return { data: { type: "pattern-complete", sequence, options: shuffledOptions }, answer };
}

function generatePuzzleGrid(locale: ChallengeLocale): { data: PuzzleGridData; answer: string } {
  const baseEmoji = pick(SHAPES, 1)[0];
  const differentEmoji = pick(SHAPES.filter(s => s !== baseEmoji), 1)[0];
  const grid: GridCell[] = [];
  const oddPosition = randomInt(0, 8);
  for (let i = 0; i < 9; i++) {
    grid.push({ id: i + 1, emoji: i === oddPosition ? differentEmoji : baseEmoji });
  }
  const { items: shuffledGrid } = shuffle(grid);
  const correctId = shuffledGrid.find(c => c.emoji === differentEmoji)!.id;

  const templates: Record<ChallengeLocale, string> = {
    fr: "Trouvez l'élément différent",
    en: "Find the odd one out",
    sw: "Tafuta kisicholingana",
  };

  const answer = correctId.toString();
  return { data: { type: "puzzle-grid", grid: shuffledGrid, description: templates[locale] }, answer };
}

function generateMathChallenge(locale: ChallengeLocale): { data: MathData; answer: string } {
  const a = randomInt(10, 50);
  const b = randomInt(1, 20);
  const op = ["+", "-"][randomInt(0, 2)];
  let ans: number;
  if (op === "+") ans = a + b; else ans = a - b;

  const templates: Record<ChallengeLocale, string> = {
    fr: `Combien font ${a} ${op} ${b} ?`,
    en: `What is ${a} ${op} ${b} ?`,
    sw: `${a} ${op} ${b} ni ngapi ?`,
  };

  return { data: { type: "math", question: templates[locale] }, answer: ans.toString() };
}

function generateCountShapes(locale: ChallengeLocale): { data: CountShapesData; answer: string } {
  const count = randomInt(3, 9);
  const shape = pick(SHAPES, 1)[0];
  const name = shapeName(shape, locale);

  const templates: Record<ChallengeLocale, string> = {
    fr: `Combien de ${name} voyez-vous ?`,
    en: `How many ${name}s do you see?`,
    sw: `Unaona ${name} ngapi?`,
  };

  return {
    data: { type: "count-shapes", emoji: shape, count, question: templates[locale] },
    answer: count.toString(),
  };
}

function getRandomChallengeType(): ChallengeType {
  const types: ChallengeType[] = [
    "puzzle-slider", "shape-select", "drag-order", "rotation",
    "click-match", "pattern-complete", "puzzle-grid",
    "math", "count-shapes",
  ];
  return types[randomInt(0, types.length)];
}

export function generateChallenge(type?: ChallengeType, locale: ChallengeLocale = "fr"): CaptchaChallenge {
  const effectiveType = type || getRandomChallengeType();
  const id = generateId();

  let challenge: { data: ChallengeData; answer: string };
  switch (effectiveType) {
    case "puzzle-slider": challenge = generatePuzzleSlider(locale); break;
    case "shape-select": challenge = generateShapeSelect(locale); break;
    case "drag-order": challenge = generateDragOrder(locale); break;
    case "rotation": challenge = generateRotation(locale); break;
    case "click-match": challenge = generateClickMatch(locale); break;
    case "pattern-complete": challenge = generatePatternComplete(locale); break;
    case "puzzle-grid": challenge = generatePuzzleGrid(locale); break;
    case "math": challenge = generateMathChallenge(locale); break;
    case "count-shapes": challenge = generateCountShapes(locale); break;
    default: challenge = generatePuzzleSlider(locale);
  }

  const token = createToken(id, challenge.answer);

  let question = "";
  switch (effectiveType) {
    case "puzzle-slider": question = challenge.data.type === "puzzle-slider" ? challenge.data.label : ""; break;
    case "shape-select": question = challenge.data.type === "shape-select" ? challenge.data.description : ""; break;
    case "drag-order": question = challenge.data.type === "drag-order" ? challenge.data.description : ""; break;
    case "rotation": question = challenge.data.type === "rotation" ? challenge.data.directionLabel : ""; break;
    case "click-match": question = "Find the matching pairs"; break;
    case "pattern-complete": question = "Complete the sequence"; break;
    case "puzzle-grid": question = challenge.data.type === "puzzle-grid" ? challenge.data.description : ""; break;
    case "math": question = challenge.data.type === "math" ? challenge.data.question : ""; break;
    case "count-shapes": question = challenge.data.type === "count-shapes" ? challenge.data.question : ""; break;
  }

  return { id, type: effectiveType, question, data: challenge.data, token, locale };
}

export function verifyChallenge(token: string, userAnswer: string): CaptchaVerifyResult {
  const parsed = parseToken(token);
  if (!parsed) return { valid: false, reason: "Invalid token format" };

  if (Date.now() > parsed.expiresAt) return { valid: false, reason: "Token expired" };

  if (usedTokens.has(token)) return { valid: false, reason: "Token already used" };

  if (!verifyTokenSignature(parsed.challengeId, parsed.answer, parsed.expiresAt, parsed.nonce, parsed.sig)) {
    return { valid: false, reason: "Invalid token signature" };
  }

  const normalizedAnswer = userAnswer.trim().toLowerCase();
  const expectedAnswer = parsed.answer.trim().toLowerCase();

  if (normalizedAnswer !== expectedAnswer) return { valid: false, reason: "Incorrect answer" };

  usedTokens.add(token);
  return { valid: true };
}

export function isTokenUsed(token: string): boolean {
  return usedTokens.has(token);
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
export const sensitiveRateLimiter = new MemoryRateLimiter(3, 60_000);

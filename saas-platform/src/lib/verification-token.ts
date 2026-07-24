import { randomBytes, createHash } from "crypto";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface VerificationToken {
  token: string;
  hashedToken: string;
  code: string;
  hashedCode: string;
  expiresAt: Date;
}

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function generateNumericCode(length: number = 6): string {
  const chars = "0123456789";
  let code = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export function generateVerificationToken(): VerificationToken {
  const rawToken = randomBytes(32).toString("hex");
  const code = generateNumericCode(6);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  return {
    token: rawToken,
    hashedToken: sha256(rawToken),
    code,
    hashedCode: sha256(code),
    expiresAt,
  };
}

export function hashToken(raw: string): string {
  return sha256(raw);
}

export function isTokenExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt) < new Date();
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let result = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    for (let i = 0; i < b.length; i++) {
      result |= b.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

/**
 * Get the JWT secret for session tokens.
 * In production, NEXTAUTH_SECRET MUST be set — throws if missing.
 * In development, falls back to a dev-only default.
 */
export function getJwtSecret(): Uint8Array {
  const raw = process.env.NEXTAUTH_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET environment variable is not set — this is a critical security risk!");
    }
    console.warn("[DEV] NEXTAUTH_SECRET not set, using DEVELOPMENT-ONLY fallback. NEVER run in production without setting this!");
    return new TextEncoder().encode("omnicore-development-only-fallback-key");
  }
  return new TextEncoder().encode(raw);
}

/**
 * Get the JWT secret for reset/invite tokens.
 * This is DERIVED from the session secret so that a reset token can NEVER
 * be used as a session token, even if both are signed with the same algorithm.
 * In production, NEXTAUTH_SECRET MUST be set.
 */
export function getResetJwtSecret(): Uint8Array {
  const raw = process.env.NEXTAUTH_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET environment variable is not set — cannot generate reset tokens!");
    }
    console.warn("[DEV] NEXTAUTH_SECRET not set, using DEVELOPMENT-ONLY fallback for reset tokens.");
    return new TextEncoder().encode("omnicore-dev-reset-secret-key-only");
  }
  // Use a different key derivation for reset tokens
  return new TextEncoder().encode(raw + "__reset_token_salt__");
}

export async function getCurrentSessionPayload() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId?: string; email?: string; role?: string };
  } catch (error) {
    console.error("getCurrentSessionPayload error:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const payload = await getCurrentSessionPayload();
    if (!payload?.userId) return null;
    return await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export async function getActiveWorkspace() {
  try {
    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("activeWorkspace")?.value;
    if (!activeWorkspaceId) return null;

    const payload = await getCurrentSessionPayload();
    if (!payload?.userId) return null;

    const workspace = await prisma.workspace.findUnique({ where: { id: activeWorkspaceId } });
    if (!workspace || !workspace.isActive) return null;

    const membership = await prisma.organizationMember.findFirst({
      where: { organizationId: workspace.organizationId, userId: payload.userId },
    });

    if (!membership && payload.role !== "SUPER_ADMIN") return null;
    return workspace;
  } catch (error) {
    console.error("getActiveWorkspace error:", error);
    return null;
  }
}

export function requireRole(...roles: string[]) {
  return async () => {
    const user = await getCurrentUser();
    if (!user) return { error: "Non authentifié", status: 401 };
    if (!roles.includes(user.role)) return { error: "Non autorisé", status: 403 };
    return { user };
  };
}

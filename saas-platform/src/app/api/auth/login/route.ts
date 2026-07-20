import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Ce compte a été désactivé." },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Ce compte utilise une connexion sociale." },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      // Log failed attempt
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          success: false,
          method: "password",
        },
      });

      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        onlineStatus: "online",
      },
    });

    // Log successful login
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
        method: "password",
      },
    });

    // Generate JWT
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? "30d" : "7d")
      .sign(getJwtSecret());

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    // Set active workspace automatically when exactly one workspace is available
    const memberships = await prisma.organizationMember.findMany({ where: { userId: user.id }, select: { organizationId: true } });
    const orgIds = memberships.map((m) => m.organizationId);
    const workspaces = await prisma.workspace.findMany({ where: { organizationId: { in: orgIds }, isActive: true } });
    const requestedWorkspaceId = cookieStore.get("activeWorkspace")?.value;
    const validWorkspace = workspaces.find((workspace) => workspace.id === requestedWorkspaceId);

    if (validWorkspace) {
      cookieStore.set("activeWorkspace", requestedWorkspaceId!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
    } else if (workspaces.length === 1) {
      cookieStore.set("activeWorkspace", workspaces[0].id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
    } else {
      cookieStore.set("activeWorkspace", "", { maxAge: 0, path: "/" });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}

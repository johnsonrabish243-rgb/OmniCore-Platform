import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db";
import { getCurrentUser, getJwtSecret } from "@/lib/auth-helpers";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    // Self-registration: allow creating accounts without admin auth
    // Admins can also create accounts for others
    const currentUser = await getCurrentUser();

    const body = await request.json();
    const { email, password, firstName, lastName, companyName, organizationId } = body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Assign role - default to EMPLOYEE for self-registration
    // SUPER_ADMIN creating accounts for others can set a custom role
    const role = currentUser?.role === "SUPER_ADMIN" ? (body.role || "EMPLOYEE") : "EMPLOYEE";

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        language: "fr",
        timezone: "Europe/Paris",
        role,
      },
    });

    // If company name provided, create organization
    if (companyName) {
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const org = await prisma.organization.create({
        data: {
          name: companyName,
          slug: slug || `org-${user.id.slice(0, 8)}`,
        },
      });

      await prisma.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: "OWNER",
          isOwner: true,
        },
      });
    }

    // If organizationId was provided, add user to that organization
    if (organizationId && !companyName) {
      const memberExists = await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId, userId: user.id } },
      }).catch(() => null);
      if (!memberExists) {
        await prisma.organizationMember.create({
          data: {
            organizationId,
            userId: user.id,
            role: "EMPLOYEE",
          },
        });
      }
    }

    // Generate session cookie for self-registration (no admin context)
    // When an admin creates a user, skip cookie to stay logged in as admin
    if (!currentUser) {
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getJwtSecret());

      const cookieStore = await cookies();
      cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}

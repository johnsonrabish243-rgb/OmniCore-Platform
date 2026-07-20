import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // Require authentication and admin role to create accounts
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des comptes. Veuillez vous connecter en tant qu'administrateur." },
        { status: 401 }
      );
    }
    if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour créer des comptes. Contactez votre administrateur." },
        { status: 403 }
      );
    }

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

    // Assign role based on creator's permission
    // Admins and super admins can set role; default to EMPLOYEE
    const role = currentUser.role === "SUPER_ADMIN" ? (body.role || "EMPLOYEE") : "EMPLOYEE";

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

    // Don't generate a session cookie — the admin creating this user
    // should stay logged in as themselves, not as the new user.
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

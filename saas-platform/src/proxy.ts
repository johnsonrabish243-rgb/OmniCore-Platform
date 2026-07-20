import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const publicPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/magic-link",
];

/**
 * Landing page paths — always public, never redirected.
 */
const landingPaths = ["/"];

/**
 * Dashboard / app paths that require authentication.
 */
const protectedPaths = [
  "/dashboard",
  "/analytics",
  "/admin",
  "/hr",
  "/crm",
  "/commerce",
  "/sales",
  "/inventory",
  "/pharmacy",
  "/education",
  "/healthcare",
  "/projects",
  "/tasks",
  "/calendar",
  "/messages",
  "/documents",
  "/settings",
  "/help",
  "/profile",
  "/notifications",
  "/workspaces",
  "/integrations",
];

/**
 * Extract locale and path without locale prefix.
 */
function getPathWithoutLocale(pathname: string): {
  locale: string;
  path: string;
} {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: routing.defaultLocale, path: pathname };
}

/**
 * Check whether a pathname (with optional locale prefix) is public.
 */
function isPublic(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return (
    publicPaths.some((p) => path === p || path.startsWith(p + "/")) ||
    landingPaths.some((p) => path === p)
  );
}

/**
 * Check whether a pathname is one of the landing pages.
 */
function isLanding(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return landingPaths.some((p) => path === p);
}

/**
 * Check whether a pathname requires authentication.
 */
function isProtected(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("session")?.value;
  const { locale } = getPathWithoutLocale(pathname);

  // Authenticated user visiting landing page → redirect to dashboard
  if (sessionToken && isLanding(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Authenticated user visiting auth pages (login, signup, etc.) → redirect to dashboard
  if (sessionToken && isPublic(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Unauthenticated user visiting protected page → redirect to landing page
  if (!sessionToken && isProtected(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Unauthenticated user visiting public pages (landing, auth pages) — allow
  if (!sessionToken && isPublic(pathname)) {
    const response = await intlMiddleware(request);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Resolve the middleware and pass the pathname to page components as a header
  const response = await intlMiddleware(request);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel` or `/static`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|static|.*\\..*).*)",
  ],
};

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

const publicPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/magic-link",
];

// Marketing pages accessible to everyone (auth or not)
const marketingPaths = [
  "/about",
  "/contact",
  "/features",
  "/pricing",
  "/privacy",
  "/terms",
  "/cookies",
];

const landingPaths = ["/"];

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

function isPublic(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return (
    publicPaths.some((p) => path === p || path.startsWith(p + "/")) ||
    landingPaths.some((p) => path === p)
  );
}

function isMarketing(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return marketingPaths.some((p) => path === p || path.startsWith(p + "/"));
}

function isLanding(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return landingPaths.some((p) => path === p);
}

function isProtected(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
}

export default async function middleware(request: NextRequest) {
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

  // Use Supabase to refresh the session and get the authenticated user
  const { supabaseResponse, user } = await updateSession(request);
  const { locale } = getPathWithoutLocale(pathname);

  // Authenticated user visiting landing page → redirect to dashboard
  if (user && isLanding(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Authenticated user visiting auth pages (login, signup) → redirect to dashboard
  if (user && isPublic(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Marketing pages: always accessible (no redirect for auth users)
  if (isMarketing(pathname)) {
    const response = await intlMiddleware(request);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Unauthenticated user visiting protected page → redirect to landing
  if (!user && isProtected(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Apply next-intl middleware and pass pathname as header
  const response = await intlMiddleware(request);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    // Match all paths except API routes, static files, _next, _vercel
    "/((?!api|_next|_vercel|static|.*\\..*).*)",
  ],
};

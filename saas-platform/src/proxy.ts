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

/**
 * Add security headers to every response.
 * - CSP: Content Security Policy
 * - XSS Protection
 * - Frame protection (clickjacking)
 * - Content type sniffing protection
 * - Referrer policy
 * - Permissions policy
 */
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https://ui-avatars.com https://4majgdg3.us-east.insforge.app; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://4majgdg3.us-east.insforge.app wss://4majgdg3.us-east.insforge.app https://*.upstash.io; " +
    "frame-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // Prevent browsers from MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // XSS Protection (legacy, modern browsers use CSP)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Clickjacking protection
  response.headers.set("X-Frame-Options", "DENY");
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions policy (limit browser features)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  
  // HTTP Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

function isProtected(pathname: string): boolean {
  const { path } = getPathWithoutLocale(pathname);
  return protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static assets and API routes (API routes manage their own security)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
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
  
  // Add security headers
  addSecurityHeaders(response);
  
  return response;
}

export const config = {
  matcher: [
    // Match all paths except API routes, static files, _next, _vercel
    "/((?!api|_next|_vercel|static|.*\\..*).*)",
  ],
};

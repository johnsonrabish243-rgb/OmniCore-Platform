import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { AppShell } from "@/components/app-shell";
import { InitialLoading } from "@/components/initial-loading";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { headers } from "next/headers";
import { loadMessages } from "@/lib/messages-loader";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Auth pages that should NOT show the sidebar/AppShell
const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/magic-link",
];

// Public marketing pages that should NOT show the sidebar/AppShell
const PUBLIC_PAGES = [
  "/about",
  "/contact",
  "/features",
  "/pricing",
  "/privacy",
  "/terms",
  "/cookies",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });

  const title = `${t("name")} | ${t("tagline")}`;
  const description = t("description");

  return {
    title,
    description,
    keywords: ["ERP", "SaaS", "OmniCore", "Kalemie", "Tanganyika", "RDC", "gestion d'entreprise", "cloud", "RH", "finance", "commerce"],
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : locale === "sw" ? "sw_KE" : "en_US",
      siteName: "OmniCore",
      url: `https://omnicore.site/${locale}`,
      images: [
        {
          url: "/omnicore-logo.png",
          width: 120,
          height: 120,
          alt: "OmniCore Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/omnicore-logo.png"],
    },
    alternates: {
      canonical: `https://omnicore.site/${locale}`,
      languages: {
        fr: "https://omnicore.site/fr",
        en: "https://omnicore.site/en",
        sw: "https://omnicore.site/sw",
      },
    },
  };
}

/**
 * Shared providers needed by both auth pages (no sidebar) and protected pages (with sidebar).
 */
function Providers({ children, locale, messages }: { children: React.ReactNode; locale: string; messages: Record<string, any> }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
    >
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Paris">
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          theme="system"
        />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await loadMessages(locale);

  // Determine if this is an auth page (login, signup, etc.) or the landing page
  // These should NOT show the sidebar/AppShell
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Strip locale prefix for comparison
  let path = pathname;
  for (const l of routing.locales) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      path = pathname.slice(l.length + 1) || "/";
      break;
    }
  }

  const isAuthPage = AUTH_PATHS.some((p) => path === p || path.startsWith(p + "/"));
  const isLandingPage = path === "/";
  const isPublicPage = PUBLIC_PAGES.some((p) => path === p || path.startsWith(p + "/"));

  // Wrap both auth/landing pages and dashboard pages with InitialLoading
  if (isAuthPage || isLandingPage || isPublicPage) {
    return (
      <Providers locale={locale} messages={messages}>
        <InitialLoading>
          {children}
        </InitialLoading>
      </Providers>
    );
  }

  return (
    <Providers locale={locale} messages={messages}>
      <InitialLoading>
        <AppShell>
          {children}
        </AppShell>
      </InitialLoading>
    </Providers>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition, useCallback } from "react";
import { getCSRFHeaders } from "@/lib/csrf";

const LOCALE_STORAGE_KEY = "omnicore_locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("locale");

  const locales = [
    { code: "fr", label: t("french"), flag: "🇫🇷" },
    { code: "en", label: t("english"), flag: "🇺🇸" },
    { code: "sw", label: t("swahili"), flag: "🇨🇩" },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = useCallback(
    (nextLocale: string) => {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      } catch {}

      fetch("/api/user/locale", {
        method: "PUT",
        headers: { ...getCSRFHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      }).catch(() => {});

      startTransition(() => {
        router.replace(pathname, { locale: nextLocale });
      });
    },
    [pathname, router]
  );

  const current = locales.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" disabled={isPending}>
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t("changeLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => switchLocale(loc.code)}
            className={locale === loc.code ? "bg-accent font-medium" : ""}
          >
            <span className="mr-2">{loc.flag}</span>
            {loc.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

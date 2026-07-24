"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("common");

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const nextTheme =
    theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  const Icon =
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  const nextLabel = nextTheme === "dark" ? t("darkMode") : nextTheme === "light" ? t("lightMode") : t("systemMode");

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(nextTheme)}
      className="relative"
      title={t("switchTheme", { mode: nextLabel })}
    >
      {Icon}
      <span className="sr-only">{t("changeTheme")}</span>
    </Button>
  );
}

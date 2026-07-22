"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(nextTheme)}
      className="relative"
      title={`Passer en mode ${nextTheme === "dark" ? "sombre" : nextTheme === "light" ? "clair" : "système"}`}
    >
      {Icon}
      <span className="sr-only">Changer de thème</span>
    </Button>
  );
}

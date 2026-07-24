"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  minimal?: boolean;
  loggedIn?: boolean;
}

export function LoadingScreen({ message, minimal = false, loggedIn = false }: LoadingScreenProps) {
  const t = useTranslations("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        const increment = prev < 30 ? 8 : prev < 60 ? 5 : prev < 80 ? 3 : 1;
        return Math.min(prev + increment, 90);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setProgress(100), 30000);
    return () => clearTimeout(timeout);
  }, []);

  const displayMessage = message || (loggedIn ? t("workspace") : t("generic"));

  if (minimal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/omnicore-logo.png"
            alt="OmniCore"
            className="h-12 w-12 rounded-[12px] object-contain shadow-sm"
          />
          <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {displayMessage && (
            <p className="text-xs text-muted-foreground">{displayMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <img
            src="/omnicore-logo.png"
            alt="OmniCore"
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-[14px] object-contain shadow-md"
          />
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              OmniCore
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {displayMessage}
            </p>
          </div>
        </div>
      </div>

      <div className="w-64 sm:w-80 mt-6">
        <div className="h-2 rounded-full bg-muted overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-500 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {message && (
        <p className="mt-4 text-xs text-muted-foreground animate-pulse-soft">
          {message}
        </p>
      )}

      {!message && (
        <p className="mt-4 text-[10px] text-muted-foreground/60">
          &copy; 2026 OmniCore. D&eacute;velopp&eacute; par John Mocket.
        </p>
      )}
    </div>
  );
}

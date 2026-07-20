"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  minimal?: boolean;
}

export function LoadingScreen({ message, minimal = false }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        // Slow down as we approach 90%
        const increment = prev < 30 ? 8 : prev < 60 ? 5 : prev < 80 ? 3 : 1;
        return Math.min(prev + increment, 90);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Once loading is truly done, the parent will unmount this component.
    // But if it doesn't, we can set to 100 after a timeout.
    const timeout = setTimeout(() => setProgress(100), 30000);
    return () => clearTimeout(timeout);
  }, []);

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
          {message && (
            <p className="text-xs text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      {/* Logo */}
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
              Chargement de votre espace de travail...
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 sm:w-80 mt-6">
        <div className="h-2 rounded-full bg-muted overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-500 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Loading Message */}
      {message && (
        <p className="mt-4 text-xs text-muted-foreground animate-pulse-soft">
          {message}
        </p>
      )}

      {/* Default Footer */}
      {!message && (
        <p className="mt-4 text-[10px] text-muted-foreground/60">
          &copy; 2026 OmniCore. Développé par John Mocket.
        </p>
      )}
    </div>
  );
}

/**
 * Hook to manage loading state with auto-completion.
 */
export function useLoading() {
  const [isLoading, setIsLoading] = useState(true);

  const done = () => setIsLoading(false);
  const start = () => setIsLoading(true);

  return {
    isLoading,
    LoadingComponent: ({ message }: { message?: string }) =>
      isLoading ? <LoadingScreen message={message} /> : null,
    done,
    start,
  };
}

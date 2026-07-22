"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";

interface InitialLoadingProps {
  children: React.ReactNode;
  /** Minimum time (ms) to show the loading screen. Default 800. */
  minDisplayMs?: number;
  /** Additional time (ms) to wait after minDisplayMs before hiding. */
  graceMs?: number;
}

/**
 * Wraps children and shows a full LoadingScreen on initial mount.
 * The loading screen stays visible for at least `minDisplayMs` milliseconds,
 * plus a `graceMs` buffer to avoid flash-of-content.
 *
 * Uses a two-phase exit: first fades out the LoadingScreen, then unmounts it
 * after the CSS transition completes, giving a smooth branded loading transition.
 */
export function InitialLoading({
  children,
  minDisplayMs = 800,
  graceMs = 200,
}: InitialLoadingProps) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    let cancelled = false;

    const hide = () => {
      if (cancelled) return;
      setPhase("fading");
      // After CSS transition (350ms), unmount completely
      setTimeout(() => {
        if (!cancelled) setPhase("done");
      }, 350);
    };

    const timer = setTimeout(hide, minDisplayMs + graceMs);

    const onLoad = () => {
      clearTimeout(timer);
      hide();
    };

    if (document.readyState !== "complete") {
      window.addEventListener("load", onLoad);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
    };
  }, [minDisplayMs, graceMs]);

  return (
    <>
      {phase !== "done" && (
        <div
          style={{
            opacity: phase === "fading" ? 0 : 1,
            transition: "opacity 350ms ease-in-out",
            pointerEvents: phase === "fading" ? "none" : "auto",
          }}
        >
          <LoadingScreen />
        </div>
      )}
      <div
        style={{
          opacity: phase === "done" ? 1 : 0,
          transition: "opacity 350ms ease-in-out",
        }}
      >
        {children}
      </div>
    </>
  );
}

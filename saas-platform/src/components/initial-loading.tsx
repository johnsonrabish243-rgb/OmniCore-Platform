"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";

interface InitialLoadingProps {
  children: React.ReactNode;
  minDisplayMs?: number;
  graceMs?: number;
}

export function InitialLoading({
  children,
  minDisplayMs = 800,
  graceMs = 200,
}: InitialLoadingProps) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
      .then((r) => r.json().catch(() => ({})))
      .then((data) => {
        if (data?.user) setLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hide = () => {
      if (cancelled) return;
      setPhase("fading");
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
          <LoadingScreen loggedIn={loggedIn} />
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

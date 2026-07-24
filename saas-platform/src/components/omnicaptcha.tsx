"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Loader2, Shield, RefreshCw, CheckCircle, XCircle, Zap } from "lucide-react";

interface CaptchaData {
  id: string;
  question: string;
  token: string;
}

interface OmniCaptchaProps {
  onVerify: (verified: boolean, token?: string) => void;
  className?: string;
  invisible?: boolean;
  id?: string;
}

const SESSION_KEY = "omnicaptcha_verified";

export function OmniCaptcha({ onVerify, className, invisible, id }: OmniCaptchaProps) {
  const t = useTranslations("omniCaptcha");
  const locale = useLocale();
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "valid" | "invalid">("loading");
  const [error, setError] = useState("");
  const [animated, setAnimated] = useState(false);
  const verifiedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const generateChallenge = useCallback(async () => {
    setStatus("loading");
    setAnswer("");
    setError("");
    verifiedRef.current = false;
    try {
      const res = await fetch("/api/captcha/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) throw new Error("Failed to generate captcha");
      const data = await res.json();
      setCaptcha(data);
      if (invisible) {
        setStatus("valid");
        onVerify(true, data.token);
        verifiedRef.current = true;
      } else {
        setStatus("ready");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch {
      setError(t("loadError"));
      setStatus("invalid");
    }
  }, [t, locale, invisible, onVerify]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleVerify = async () => {
    if (!captcha || !answer.trim() || verifiedRef.current) return;
    setStatus("verifying");
    setError("");
    try {
      const res = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ token: captcha.token, answer: answer.trim() }),
      });
      const result = await res.json();
      if (result.valid) {
        setStatus("valid");
        verifiedRef.current = true;
        onVerify(true, captcha.token);
      } else {
        setStatus("invalid");
        setError(t("incorrect"));
        onVerify(false);
        setTimeout(() => generateChallenge(), 1500);
      }
    } catch {
      setStatus("invalid");
      setError(t("verifyError"));
      onVerify(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  if (invisible) {
    if (status === "valid" || verifiedRef.current) return null;
    return (
      <div id={id} className={cn("flex items-center gap-2", className)}>
        {status === "loading" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>OmniCaptcha…</span>
          </div>
        )}
        {status === "invalid" && (
          <button
            type="button"
            onClick={generateChallenge}
            className="flex items-center gap-1 text-xs text-destructive hover:underline transition-colors"
          >
            <XCircle className="h-3 w-3" />
            {error || t("loadError")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[14px] border border-border/50 bg-gradient-to-b from-muted/40 to-muted/20 p-4 space-y-3 transition-all duration-300",
        status === "valid" && "border-emerald-500/30 bg-emerald-500/5",
        status === "invalid" && "border-destructive/30 bg-destructive/5",
        animated && "animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors duration-300",
              status === "valid" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
            )}
          >
            {status === "valid" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {status === "valid" ? t("verified") : t("title")}
          </span>
        </div>
        {status === "ready" && (
          <button
            onClick={generateChallenge}
            className="flex h-7 w-7 items-center justify-center rounded-[8px] hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
            title={t("refresh")}
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground animate-pulse">OmniCaptcha…</span>
          </div>
        </div>
      )}

      {status === "valid" && (
        <div className="flex items-center gap-2.5 py-3 transition-all duration-500 animate-fade-in-up">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t("verified")}</p>
            <p className="text-[10px] text-muted-foreground/60">{t("footer")}</p>
          </div>
        </div>
      )}

      {(status === "ready" || status === "invalid" || status === "verifying") && captcha && (
        <div className={cn("space-y-3 transition-all duration-300", status === "invalid" && "animate-shake")}>
          <div className="relative overflow-hidden rounded-[12px] border border-border/40 bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
            <div className="px-4 py-3.5 text-center">
              <p className="text-base font-semibold tracking-tight text-foreground/90">{captcha.question}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder={t("answerPlaceholder")}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === "verifying"}
                className={cn(
                  "w-full h-10 rounded-[10px] border bg-background px-3 text-sm outline-none transition-all duration-200",
                  "border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:shadow-sm",
                  "placeholder:text-muted-foreground/40 disabled:opacity-50",
                  status === "invalid" && "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/10"
                )}
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={handleVerify}
              disabled={!answer.trim() || status === "verifying"}
              className={cn(
                "flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-sm font-medium transition-all duration-200 shrink-0",
                "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                status === "verifying" && "opacity-70"
              )}
            >
              {status === "verifying" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  {t("verify")}
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in-up">
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-1">
        <Shield className="h-3 w-3 text-muted-foreground/30" />
        <p className="text-[10px] text-muted-foreground/40 text-center">{t("footer")}</p>
      </div>
    </div>
  );
}

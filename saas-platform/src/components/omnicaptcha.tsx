"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Loader2, Shield, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CaptchaData {
  id: string;
  question: string;
  token: string;
}

interface OmniCaptchaProps {
  onVerify: (verified: boolean, token?: string) => void;
  className?: string;
}

/**
 * OmniCaptcha — Proprietary, self-hosted captcha component.
 * Generates math-based challenges and verifies them server-side.
 * No third-party tracking, no cookies, fully private.
 */
export function OmniCaptcha({ onVerify, className }: OmniCaptchaProps) {
  const t = useTranslations("omniCaptcha");
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "valid" | "invalid">("loading");
  const [error, setError] = useState("");

  const generateChallenge = useCallback(async () => {
    setStatus("loading");
    setAnswer("");
    setError("");
    try {
      const res = await fetch("/api/captcha/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "math" }),
      });
      if (!res.ok) throw new Error("Failed to generate captcha");
      const data = await res.json();
      setCaptcha(data);
      setStatus("ready");
    } catch {
      setError(t("loadError"));
      setStatus("invalid");
    }
  }, [t]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleVerify = async () => {
    if (!captcha || !answer.trim()) return;
    setStatus("verifying");
    setError("");
    try {
      const res = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captcha.token, answer: answer.trim() }),
      });
      const result = await res.json();
      if (result.valid) {
        setStatus("valid");
        onVerify(true, captcha.token);
      } else {
        setStatus("invalid");
        setError(t("incorrect"));
        onVerify(false);
        // Auto-regenerate after incorrect attempt
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

  return (
    <div className={cn("rounded-[12px] border border-border/50 bg-muted/30 p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {t("title")}
          </span>
        </div>
        {status === "ready" && (
          <button
            onClick={generateChallenge}
            className="flex h-6 w-6 items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
            title={t("refresh")}
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Challenge */}
      {status === "loading" && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === "valid" && (
        <div className="flex items-center gap-2 py-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{t("verified")}</span>
        </div>
      )}

      {(status === "ready" || status === "invalid" || status === "verifying") && captcha && (
        <>
          {/* Question */}
          <div className="bg-card rounded-[10px] border border-border/40 px-4 py-3 text-center">
            <p className="text-base font-semibold tracking-tight">{captcha.question}</p>
          </div>

          {/* Answer Input */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("answerPlaceholder")}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === "verifying"}
              className="h-9 text-sm"
              autoComplete="off"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleVerify}
              disabled={!answer.trim() || status === "verifying"}
              className="shrink-0"
            >
              {status === "verifying" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("verify")
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/50 text-center">
        {t("footer")}
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { getCSRFHeaders } from "@/lib/csrf";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uId = params.get("userId");
    const tk = params.get("token");
    if (uId && tk) {
      setUserId(uId);
      setToken(tk);
      setStatus("ready");
    } else {
      setMessage(t("invalidVerificationLink"));
      setStatus("error");
    }
  }, [t]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backward" && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6 || !userId) return;

    setStatus("verifying");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { ...getCSRFHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: fullCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(t("emailVerified"));
        setTimeout(() => router.replace(`/${locale}/login?message=email_verified`), 2000);
      } else {
        setStatus("ready");
        setMessage(data.error || t("verificationFailed"));
      }
    } catch {
      setStatus("ready");
      setMessage(t("serverError"));
    }
  }, [code, userId, t, locale, router]);

  const handleResend = useCallback(async () => {
    if (!userId || resendCooldown > 0) return;

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { ...getCSRFHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(t("verificationEmailResent"));
        setResendCooldown(120);
      } else {
        setMessage(data.error || t("serverError"));
      }
    } catch {
      setMessage(t("serverError"));
    }
  }, [userId, resendCooldown, t]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-[440px] animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("verifyEmail")}</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">{t("verifyEmailSent")}</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-6">
            {status === "loading" && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                <p className="text-lg font-semibold">{message}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("redirectingToLogin")}</p>
              </div>
            )}

            {(status === "ready" || status === "verifying") && (
              <>
                <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-lg font-bold"
                      disabled={status === "verifying"}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerify}
                  className="w-full h-11 gap-2"
                  disabled={code.join("").length !== 6 || status === "verifying"}
                >
                  {status === "verifying" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {t("verifyEmail")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || status === "verifying"}
                  >
                    {resendCooldown > 0
                      ? t("resendIn", { seconds: resendCooldown })
                      : t("resendCode")}
                  </Button>
                </div>

                {message && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}
              </>
            )}

            {status === "error" && !userId && (
              <div className="flex flex-col items-center py-8 text-center">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <p className="text-lg font-semibold">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

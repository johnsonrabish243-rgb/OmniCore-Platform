"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { OmniCaptcha } from "@/components/omnicaptcha";
import { getCSRFHeaders } from "@/lib/csrf";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!captchaVerified) {
      setError(t("captchaRequired"));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { ...getCSRFHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });
      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-[440px] animate-fade-in-up text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{t("emailSent")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("resetEmailSent")} <strong>{email}</strong>.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            {t("checkSpam")}
          </p>
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-[440px] animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <img src="/omnicore-logo.png" alt="OmniCore" className="h-14 w-14 rounded-[16px] object-contain shadow-lg mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">{t("resetPassword")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <OmniCaptcha
                onVerify={(verified, token) => {
                  setCaptchaVerified(verified);
                  if (token) setCaptchaToken(token);
                }}
                invisible
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full h-11" loading={isLoading}>
                {t("sendMagicLink")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

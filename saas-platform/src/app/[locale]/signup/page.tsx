"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Globe,
} from "lucide-react";

export default function SignUpPage() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    try {
      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value || '';
      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value || '';
      const company = (document.getElementById('company') as HTMLInputElement)?.value || '';
      const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
      const password = (document.getElementById('password') as HTMLInputElement)?.value || '';

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, companyName: company }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/${window.location.pathname.split('/')[1] || 'fr'}/dashboard`;
      } else {
        alert(data.error || 'Erreur lors de l\'inscription');
      }
    } catch {
      alert('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[440px] animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/omnicore-logo.png" alt="OmniCore" className="h-14 w-14 rounded-[16px] object-contain shadow-lg mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">{t("createAccount")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                  s <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`h-[2px] w-12 transition-all duration-300 ${
                    step > s ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Sign Up Card */}
        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-6">
            {/* Invitation-only notice */}
            <div className="p-4 rounded-[12px] bg-primary/5 border border-primary/20 mb-4">
              <p className="text-sm text-center text-muted-foreground">
                {t("invitationOnly")}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="firstName">
                        {t("firstName")}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="Jean"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="lastName">
                        {t("lastName")}
                      </label>
                      <Input id="lastName" placeholder="Dupont" required />
                    </div>
                  </div>

                  {/* Email */}
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
                        required
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="company">
                      {t("companyName")}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Ma Société SAS"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11">
                    Continuer
                  </Button>
                </>
              ) : (
                <>
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">
                      {t("password")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="confirmPassword">
                      {t("confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 h-4 w-4 rounded-[4px] border-border text-primary focus:ring-ring"
                      required
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground">
                      J&apos;accepte les{" "}
                      <a href="#" className="text-primary hover:underline">
                        conditions d&apos;utilisation
                      </a>{" "}
                      et la{" "}
                      <a href="#" className="text-primary hover:underline">
                        politique de confidentialité
                      </a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11"
                    loading={isLoading}
                  >
                    {t("createAccount")}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Retour
                  </button>
                </>
              )}
            </form>

            {/* Social Sign Up */}
            <div className="mt-6">
              <div className="relative mb-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2 h-10">
                  <Globe className="h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="gap-2 h-10">
                  <Globe className="h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

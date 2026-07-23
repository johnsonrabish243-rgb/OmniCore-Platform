"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
} from "lucide-react";

export default function SignUpPage() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ws = params.get("workspace");
    if (ws) setSelectedWorkspace(ws);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value || '';
      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value || '';
      const company = (document.getElementById('company') as HTMLInputElement)?.value || '';
      const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
      const password = (document.getElementById('password') as HTMLInputElement)?.value || '';
      const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value || '';

      if (password !== confirmPassword) {
        setError(t('passwordMismatch'));
        setIsLoading(false);
        return;
      }

      // Step 1: Create auth user with browser client (sets cookies automatically)
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already')) {
          setError(t('accountExists'));
        } else {
          setError(authError.message || t('serverError'));
        }
        return;
      }

      if (!authData.user) {
        setError(t('serverError'));
        return;
      }

      // Step 2: Create user profile + organization via server API
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          email,
          firstName,
          lastName,
          companyName: company,
          workspace: selectedWorkspace,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Profile creation error:', data.error);
        // Profile creation failed but auth user exists — still redirect to login
      }

      // Check if user is already signed in (auto-confirm enabled) or needs verification
      const locale = window.location.pathname.split('/')[1] || 'fr';
      
      if (authData.session) {
        // Auto-confirmed: redirect to workspaces
        window.location.href = `/${locale}/workspaces`;
      } else {
        // Email confirmation required: redirect to login with success message
        window.location.href = `/${locale}/login?message=account_created`;
      }
    } catch {
      setError(t('serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });
  };

  const handleGitHubSignUp = async () => {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });
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
                    {t("continue")}
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
                      {t("acceptTerms")}{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        {t("termsOfService")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        {t("privacyPolicy")}
                      </Link>
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
                    {t("back")}
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
                <Button variant="outline" className="gap-2 h-10" onClick={handleGoogleSignUp}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </Button>
                <Button variant="outline" className="gap-2 h-10" onClick={handleGitHubSignUp}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
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

"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      // After successful login, handle workspace redirect
      // Fetch session to determine workspaces/orgs
      const sessRes = await fetch('/api/auth/session');
      if (sessRes.ok) {
        const sess = await sessRes.json();
        const userOrgs = sess.user?.organizations || [];

        // Fetch workspaces for user orgs
        const workspacesRes = await fetch('/api/admin/workspaces');
        if (workspacesRes.ok) {
          const list = await workspacesRes.json();
          const workspaces = list.workspaces || [];

          if (workspaces.length === 1) {
            // Automatically select the single workspace
            const pick = workspaces[0];
            await fetch('/api/user/update', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ activeWorkspaceId: pick.id }),
            });
            // Redirect to dashboard
            window.location.href = `/${window.location.pathname.split('/')[1] || 'fr'}/dashboard`;
            return;
          }

          if (workspaces.length > 1) {
            window.location.href = `/${window.location.pathname.split('/')[1] || 'fr'}/workspaces`;
            return;
          }

          // No workspaces available - send to the dedicated workspace page for onboarding.
          window.location.href = `/${window.location.pathname.split('/')[1] || 'fr'}/workspaces`;
          return;
        }
      }

      // Fallback: go to dashboard
      window.location.href = `/${window.location.pathname.split('/')[1] || 'fr'}/dashboard`;
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });
  };

  const handleGitHubLogin = async () => {
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
          <h1 className="text-2xl font-bold tracking-tight">{t("welcome")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">
                    {t("password")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-[10px] bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11"
                loading={isLoading}
              >
                {t("signIn")}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative mb-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2 h-10" onClick={handleGoogleLogin}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </Button>
                <Button variant="outline" className="gap-2 h-10" onClick={handleGitHubLogin}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </Button>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("signUp")}
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Magic Link */}
        <div className="mt-4 text-center">
          <Link
            href="/magic-link"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("sendMagicLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}

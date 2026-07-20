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
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (res.ok) {
        // After successful login, fetch session to determine workspaces/orgs
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
      } else {
        alert(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Login error:', err);
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

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-[4px] border-border text-primary focus:ring-ring"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  {t("rememberMe")}
                </label>
              </div>

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

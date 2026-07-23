"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MODULE_HREF_MAP: Record<string, string> = {
  hr: "/hr",
  crm: "/crm",
  commerce: "/commerce",
  sales: "/sales",
  inventory: "/inventory",
  pharmacy: "/pharmacy",
  education: "/education",
  healthcare: "/healthcare",
  projects: "/projects",
  tasks: "/tasks",
  calendar: "/calendar",
  messages: "/messages",
  documents: "/documents",
};

interface RouteGuardProps {
  moduleId: string;
  children: ReactNode;
  /** If true, shows a blocked message instead of redirecting */
  fallback?: "block" | "redirect";
}

/**
 * Route guard that checks if a module is enabled for the current workspace.
 * - `block`: Shows a "module not available" message
 * - `redirect`: Redirects to dashboard
 */
export function RouteGuard({ moduleId, children, fallback = "block" }: RouteGuardProps) {
  const router = useRouter();
  const t = useTranslations("routeGuard");
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">("loading");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          const user = data.user;

          // Admins bypass restrictions
          if (["SUPER_ADMIN", "ADMIN"].includes(user?.role)) {
            setStatus("allowed");
            return;
          }

          const enabledModules: string[] = user?.activeWorkspace?.enabledModules || [];
          
          // If no modules configured, allow all (backward compatible)
          if (enabledModules.length === 0) {
            setStatus("allowed");
            return;
          }

          if (enabledModules.includes(moduleId)) {
            setStatus("allowed");
          } else {
            setStatus("blocked");
            // Handle redirect inside the same effect to avoid conditional hooks
            if (fallback === "redirect") {
              router.push("/dashboard");
            }
          }
        } else {
          setStatus("blocked");
        }
      } catch {
        setStatus("blocked");
      }
    }
    check();
  }, [moduleId, router, fallback]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (status === "blocked") {
    // Redirect is handled inside the useEffect above
    if (fallback === "redirect") return null;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/30">
                <Shield className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{t('moduleNotAvailable')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('moduleNotAvailableDesc')}
            </p>
            <Button variant="outline" className="gap-2" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

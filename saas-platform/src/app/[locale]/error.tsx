"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function ErrorPage({
  reset,
}: {
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-destructive/10 mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {t("serverErrorTitle")}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t("serverErrorDescription")}
      </p>
      <div className="flex items-center gap-4">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("retry")}
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            {t("home")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

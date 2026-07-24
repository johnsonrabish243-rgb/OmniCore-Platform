"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
      <div className="text-8xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        {t("notFoundTitle")}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t("notFoundDescription")}
      </p>
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            {t("home")}
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            {t("dashboard")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

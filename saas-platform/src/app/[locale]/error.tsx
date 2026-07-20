"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-destructive/10 mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Désolé, quelque chose s&apos;est mal passé. Veuillez réessayer ou
        contacter le support si le problème persiste.
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}

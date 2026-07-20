"use client";

import { toast } from "sonner";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function showToast(message: string, type: ToastType = "info", description?: string) {
  toast.custom(
    (t) => (
      <div className="flex items-start gap-3 rounded-[14px] border border-border/50 bg-background p-4 shadow-lg">
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    {
      duration: 4000,
    }
  );
}

export { toast };

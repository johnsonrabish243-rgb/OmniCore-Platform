import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "text-foreground border",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        info: "border-transparent bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
        premium:
          "bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

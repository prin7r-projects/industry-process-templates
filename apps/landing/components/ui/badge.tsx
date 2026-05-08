import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "verified" | "accent";

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const styles = {
    default: "bg-paper-2 text-graphite border border-rule",
    verified: "bg-paper-2 text-ink border border-rule",
    accent: "bg-cinnabar-wash text-cinnabar-deep border border-cinnabar",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

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
    // Wave 2 design fix 2026-06-02: "accent" variant switched from a
    // warm-pink cinnabar wash to a cool-neutral ink fill so badges
    // never read as warm pink on the page.
    accent: "bg-ink text-paper border border-ink",
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

import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
};

export function Wordmark({ className, size = "md", showName = true }: WordmarkProps) {
  const dimensions = {
    sm: { container: "h-7", line: "h-7", glyph: 14, dot: 5 },
    md: { container: "h-9", line: "h-9", glyph: 18, dot: 6 },
    lg: { container: "h-14", line: "h-14", glyph: 28, dot: 9 },
  } as const;

  const d = dimensions[size];
  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  } as const;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="Plumbline">
      <span className={cn("relative inline-flex items-center justify-center", d.container)} aria-hidden="true">
        <svg width={d.glyph} height={d.glyph * 2} viewBox={`0 0 ${d.glyph} ${d.glyph * 2}`} fill="none">
          <line
            x1={d.glyph / 2}
            y1="0"
            x2={d.glyph / 2}
            y2={d.glyph * 2 - d.dot * 2 - 1}
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx={d.glyph / 2} cy={d.glyph * 2 - d.dot} r={d.dot} fill="#D04841" />
        </svg>
      </span>
      {showName && (
        <span className={cn("font-serif italic font-normal text-ink tracking-tight", textSize[size])}>
          Plumbline
        </span>
      )}
    </span>
  );
}

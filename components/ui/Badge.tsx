import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Variant = "neutral" | "accent" | "positive" | "negative" | "warning";
const v: Record<Variant, string> = {
  neutral: "bg-[var(--bg-sunk)] text-[var(--text-muted)] border border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-ink)] border border-[var(--accent-soft)]",
  positive: "bg-[var(--positive-soft)] text-[var(--positive)] border border-[var(--positive-soft)]",
  negative: "bg-[var(--negative-soft)] text-[var(--negative)] border border-[var(--negative-soft)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-soft)]",
};

export function Badge({ children, variant = "neutral", className }: { children: ReactNode; variant?: Variant; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 h-5 text-[11px] font-medium rounded-full whitespace-nowrap",
        v[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

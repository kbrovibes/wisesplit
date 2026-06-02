"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const base =
  "inline-flex select-none items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--accent)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--text)] text-[var(--bg)] hover:opacity-90 shadow-[var(--shadow-sm)]",
  secondary:
    "bg-[var(--bg-elev)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-sunk)]",
  ghost:
    "text-[var(--text)] hover:bg-[var(--bg-sunk)]",
  danger:
    "bg-[var(--negative)] text-white hover:opacity-90",
  outline:
    "border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--bg-sunk)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[var(--radius-sm)]",
  md: "h-10 px-4 text-sm rounded-[var(--radius-md)]",
  lg: "h-12 px-5 text-[15px] rounded-[var(--radius-md)]",
  icon: "h-9 w-9 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "secondary", size = "md", loading, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
});

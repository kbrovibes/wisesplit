"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const fieldBase =
  "w-full bg-[var(--bg-elev)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-faint)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)]";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode;
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leading, trailing, ...rest },
  ref
) {
  if (leading || trailing) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 h-10 rounded-[var(--radius-md)]",
          fieldBase,
          className
        )}
      >
        {leading && <div className="text-[var(--text-muted)] shrink-0">{leading}</div>}
        <input
          ref={ref}
          className="flex-1 bg-transparent outline-none placeholder:text-[var(--text-faint)] text-sm"
          {...rest}
        />
        {trailing && <div className="text-[var(--text-muted)] shrink-0">{trailing}</div>}
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn("h-10 px-3 rounded-[var(--radius-md)] text-sm", fieldBase, className)}
      {...rest}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 3, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn("px-3 py-2 rounded-[var(--radius-md)] text-sm resize-none", fieldBase, className)}
        {...rest}
      />
    );
  }
);

export function Label({ children, hint, className }: { children: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <label className={cn("text-[12px] uppercase tracking-[0.06em] font-medium text-[var(--text-muted)] flex items-center justify-between", className)}>
      <span>{children}</span>
      {hint && <span className="text-[var(--text-faint)] normal-case tracking-normal">{hint}</span>}
    </label>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

export function Dialog({ open, onClose, title, description, children, footer, size = "md", className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ws-fade-in" role="dialog" aria-modal="true">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative w-full ws-elev ws-scale-in shadow-[var(--shadow-lg)]",
          sizes[size],
          className
        )}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-3">
            {title && <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--bg-sunk)] rounded-b-[var(--radius-lg)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

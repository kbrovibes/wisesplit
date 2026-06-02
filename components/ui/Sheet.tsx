"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  side?: "right" | "bottom";
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Sheet({ open, onClose, side = "right", title, children, footer, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 ws-fade-in" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className={cn(
          "absolute bg-[var(--bg-elev)] shadow-[var(--shadow-lg)] flex flex-col ws-slide-up",
          side === "right" && "right-0 top-0 h-full w-full sm:w-[440px] border-l border-[var(--border)] rounded-l-[var(--radius-xl)] sm:rounded-l-[var(--radius-xl)]",
          side === "bottom" && "bottom-0 left-0 right-0 max-h-[90vh] rounded-t-[var(--radius-xl)] border-t border-[var(--border)]",
          className
        )}
      >
        {title && (
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 rounded-md hover:bg-[var(--bg-sunk)] grid place-items-center text-[var(--text-muted)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto ws-scroll px-6 pb-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end gap-2 bg-[var(--bg-sunk)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

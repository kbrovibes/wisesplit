"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Item = { label: ReactNode; onClick?: () => void; danger?: boolean; icon?: ReactNode; shortcut?: string };

export function Menu({ trigger, items, align = "end" }: { trigger: ReactNode; items: Item[]; align?: "start" | "end" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open && (
        <div
          className={cn(
            "absolute z-30 mt-2 min-w-[200px] rounded-[var(--radius-md)] bg-[var(--bg-elev)] border border-[var(--border)] shadow-[var(--shadow-lg)] p-1 ws-scale-in origin-top",
            align === "end" ? "right-0" : "left-0"
          )}
          role="menu"
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => { it.onClick?.(); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 h-9 text-sm rounded-[var(--radius-sm)] hover:bg-[var(--bg-sunk)] transition-colors text-left",
                it.danger ? "text-[var(--negative)]" : "text-[var(--text)]"
              )}
              role="menuitem"
            >
              <span className="flex items-center gap-2">{it.icon}{it.label}</span>
              {it.shortcut && <span className="text-[11px] text-[var(--text-faint)] font-mono">{it.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Item = { id: string; label: ReactNode; content: ReactNode };

export function Tabs({ items, initial, onChange, className }: { items: Item[]; initial?: string; onChange?: (id: string) => void; className?: string }) {
  const [active, setActive] = useState(initial ?? items[0]?.id);
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-1">
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => { setActive(it.id); onChange?.(it.id); }}
              className={cn(
                "relative px-3 h-9 text-sm font-medium transition-colors",
                isActive ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              {it.label}
              {isActive && (
                <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-[var(--accent)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{items.find((x) => x.id === active)?.content}</div>
    </div>
  );
}

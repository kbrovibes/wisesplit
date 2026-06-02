"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Item = { id: string; label: ReactNode; content: ReactNode };

export function Tabs({ items, initial, onChange, className }: { items: Item[]; initial?: string; onChange?: (id: string) => void; className?: string }) {
  const [active, setActive] = useState(initial ?? items[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const idx = items.findIndex((x) => x.id === active);
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % items.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    const nextId = items[next].id;
    setActive(nextId);
    onChange?.(nextId);
    refs.current[nextId]?.focus();
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div role="tablist" aria-orientation="horizontal" onKeyDown={onKey} className="flex items-center gap-1 border-b border-[var(--border)] px-1">
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => { refs.current[it.id] = el; }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${it.id}`}
              id={`tab-${it.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => { setActive(it.id); onChange?.(it.id); }}
              className={cn(
                "relative px-3 h-9 text-sm font-medium transition-colors focus-visible:outline-none",
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
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
        className="pt-4 focus-visible:outline-none"
      >
        {items.find((x) => x.id === active)?.content}
      </div>
    </div>
  );
}

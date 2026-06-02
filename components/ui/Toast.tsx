"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "default" | "success" | "error";
type Toast = { id: string; title: string; description?: string; tone: Tone; action?: { label: string; onClick: () => void } };

type Store = {
  items: Toast[];
  push: (t: Omit<Toast, "id" | "tone"> & { tone?: Tone }) => string;
  dismiss: (id: string) => void;
};

export const useToasts = create<Store>((set, get) => ({
  items: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast: Toast = { id, tone: t.tone ?? "default", title: t.title, description: t.description, action: t.action };
    set({ items: [...get().items, toast] });
    setTimeout(() => get().dismiss(id), 4200);
    return id;
  },
  dismiss: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
}));

export function toast(title: string, opts?: { description?: string; tone?: Tone; action?: { label: string; onClick: () => void } }) {
  return useToasts.getState().push({ title, ...(opts ?? {}) });
}

const toneStyle: Record<Tone, string> = {
  default: "bg-[var(--text)] text-[var(--bg)]",
  success: "bg-[var(--positive)] text-white",
  error: "bg-[var(--negative)] text-white",
};

export function Toaster() {
  const items = useToasts((s) => s.items);
  const dismiss = useToasts((s) => s.dismiss);
  useEffect(() => {}, [items.length]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "ws-slide-up pointer-events-auto rounded-full px-4 py-2 shadow-[var(--shadow-lg)] text-sm flex items-center gap-3 max-w-md",
            toneStyle[t.tone]
          )}
          role="status"
        >
          <span className="font-medium">{t.title}</span>
          {t.description && <span className="opacity-80">{t.description}</span>}
          {t.action && (
            <button
              onClick={() => { t.action!.onClick(); dismiss(t.id); }}
              className="underline underline-offset-2 font-medium opacity-90 hover:opacity-100"
            >
              {t.action.label}
            </button>
          )}
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100 ml-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

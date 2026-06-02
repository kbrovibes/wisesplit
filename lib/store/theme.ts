"use client";

import { create } from "zustand";

type Theme = "light" | "dark" | "system";

type State = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  hydrate: () => void;
};

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return "light" as const;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const resolved = t === "system" ? (mql.matches ? "dark" : "light") : t;
  document.documentElement.setAttribute("data-theme", resolved);
  return resolved;
}

export const useTheme = create<State>((set) => ({
  theme: "system",
  resolved: "light",
  setTheme: (t) => {
    try { localStorage.setItem("ws-theme", t); } catch {}
    const resolved = applyTheme(t);
    set({ theme: t, resolved });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    let stored: Theme = "system";
    try {
      const s = localStorage.getItem("ws-theme");
      if (s === "dark" || s === "light" || s === "system") stored = s;
    } catch {}
    const resolved = applyTheme(stored);
    set({ theme: stored, resolved });
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", () => {
      if (useTheme.getState().theme === "system") {
        const r = applyTheme("system");
        set({ resolved: r });
      }
    });
  },
}));

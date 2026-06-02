"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/store/ui";

/** Keyboard shortcuts: `/` focus search, `N` new expense, `g x` jump, `?` shortcuts. */
export function useShortcuts() {
  const router = useRouter();
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const setNewExpenseOpen = useUI((s) => s.setNewExpenseOpen);
  const gPressed = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isInput) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (gPressed.current) {
        gPressed.current = false;
        if (key === "d") router.push("/dashboard");
        else if (key === "g") router.push("/groups");
        else if (key === "f") router.push("/friends");
        else if (key === "s") router.push("/settings");
        else if (key === "a") router.push("/activity");
        return;
      }
      if (key === "g") { gPressed.current = true; setTimeout(() => (gPressed.current = false), 900); return; }
      if (key === "/") { e.preventDefault(); setPaletteOpen(true); return; }
      if (key === "n") { e.preventDefault(); setNewExpenseOpen(true); return; }
      if (key === "?") { e.preventDefault(); setPaletteOpen(true); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, setPaletteOpen, setNewExpenseOpen]);
}

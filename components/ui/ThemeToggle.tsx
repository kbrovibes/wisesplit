"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/store/theme";
import { Menu } from "./Menu";
import { Sun, Moon, Monitor } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme((s) => s.theme);
  const resolved = useTheme((s) => s.resolved);
  const setTheme = useTheme((s) => s.setTheme);
  const hydrate = useTheme((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  const Icon = resolved === "dark" ? Moon : Sun;
  return (
    <Menu
      trigger={
        <button
          aria-label="Theme"
          className={cn(
            "h-9 w-9 grid place-items-center rounded-[var(--radius-md)] hover:bg-[var(--bg-sunk)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors",
            className
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </button>
      }
      items={[
        { label: "Light", icon: <Sun className="h-4 w-4" />, onClick: () => setTheme("light"), shortcut: theme === "light" ? "✓" : "" },
        { label: "Dark", icon: <Moon className="h-4 w-4" />, onClick: () => setTheme("dark"), shortcut: theme === "dark" ? "✓" : "" },
        { label: "System", icon: <Monitor className="h-4 w-4" />, onClick: () => setTheme("system"), shortcut: theme === "system" ? "✓" : "" },
      ]}
    />
  );
}

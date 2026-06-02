"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Search, Settings, Group as GroupIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/groups", label: "Groups", icon: GroupIcon },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "You", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden sticky bottom-0 z-20 grid grid-cols-5 bg-[var(--bg-elev)]/90 backdrop-blur border-t border-[var(--border)]">
      {nav.map((n) => {
        const Icon = n.icon;
        const active = pathname?.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
              active ? "text-[var(--text)]" : "text-[var(--text-faint)]"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-[var(--accent)]")} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

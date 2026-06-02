"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Settings, Users, Group as GroupIcon, Wallet, Search } from "@/components/icons";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils/cn";
import { useData } from "@/lib/store/data";
import { Avatar } from "@/components/ui/Avatar";
import { Kbd } from "@/components/ui/Kbd";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/groups", label: "Groups", icon: GroupIcon },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const groups = useData((s) => s.groups);
  const users = useData((s) => s.users);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] h-screen sticky top-0">
      <div className="px-4 h-14 flex items-center">
        <Link href="/dashboard"><Logo size={22} /></Link>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 mt-2">
        {nav.map((n) => {
          const active = pathname?.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 px-2.5 h-9 rounded-[var(--radius-md)] text-sm transition-colors",
                active
                  ? "bg-[var(--bg-sunk)] text-[var(--text)] font-medium"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-sunk)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-6 mb-1 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">Groups</span>
        <Wallet className="h-3.5 w-3.5 text-[var(--text-faint)]" />
      </div>

      <div className="flex-1 overflow-y-auto ws-scroll px-2">
        {groups.length === 0 && (
          <div className="text-xs text-[var(--text-faint)] px-2.5 py-2">No groups yet</div>
        )}
        {groups.map((g) => {
          const href = `/group?id=${g.id}`;
          const active = pathname === href;
          const memberNames = g.memberIds.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean) as string[];
          return (
            <Link
              key={g.id}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2.5 h-9 rounded-[var(--radius-md)] text-sm transition-colors",
                active
                  ? "bg-[var(--bg-sunk)] text-[var(--text)] font-medium"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-sunk)] hover:text-[var(--text)]"
              )}
            >
              <span className="h-6 w-6 rounded-[var(--radius-sm)] grid place-items-center text-[10px] font-medium text-white shrink-0" style={{ background: g.color }}>
                {(g.name || "?")[0].toUpperCase()}
              </span>
              <span className="truncate">{g.name}</span>
              <span className="ml-auto text-[11px] text-[var(--text-faint)]">{memberNames.length}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t border-[var(--border)] flex items-center gap-2">
        <Avatar name={users.find((u) => u.id === useData.getState().meId)?.name ?? "You"} size={28} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate">{users.find((u) => u.id === useData.getState().meId)?.name ?? "You"}</p>
          <p className="text-[11px] text-[var(--text-faint)] truncate">Demo mode · local-only</p>
        </div>
        <Kbd>⌘K</Kbd>
      </div>
    </aside>
  );
}

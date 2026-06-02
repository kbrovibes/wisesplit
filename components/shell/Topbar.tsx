"use client";

import { Plus, Search } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUI } from "@/lib/store/ui";
import { Logo } from "./Logo";
import Link from "next/link";

export function Topbar({ title, subtitle, actions }: { title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const setNewExpenseOpen = useUI((s) => s.setNewExpenseOpen);

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[var(--bg)]/80 border-b border-[var(--border)]">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
        <div className="lg:hidden">
          <Link href="/dashboard"><Logo size={22} /></Link>
        </div>
        <div className="hidden lg:flex flex-col min-w-0 mr-2">
          {title && <h1 className="font-display text-[15px] font-semibold tracking-tight truncate leading-tight">{title}</h1>}
          {subtitle && <p className="text-[12px] text-[var(--text-muted)] truncate leading-tight">{subtitle}</p>}
        </div>

        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 ml-auto h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] hover:bg-[var(--bg-sunk)] text-sm text-[var(--text-muted)] min-w-[280px] transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <Kbd>⌘K</Kbd>
        </button>

        <button
          onClick={() => setPaletteOpen(true)}
          aria-label="Search"
          className="md:hidden ml-auto h-9 w-9 grid place-items-center rounded-[var(--radius-md)] hover:bg-[var(--bg-sunk)] text-[var(--text-muted)]"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <ThemeToggle />
        <Button onClick={() => setNewExpenseOpen(true)} variant="primary" size="md" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" /> New expense
        </Button>
        <Button onClick={() => setNewExpenseOpen(true)} variant="primary" size="icon" className="sm:hidden" aria-label="New expense">
          <Plus className="h-4 w-4" />
        </Button>
        {actions}
      </div>
    </header>
  );
}

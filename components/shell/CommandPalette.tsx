"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/store/ui";
import { useData } from "@/lib/store/data";
import { search as runSearch } from "@/lib/search/engine";
import type { Searchable } from "@/lib/search/engine";
import { Avatar } from "@/components/ui/Avatar";
import { Kbd } from "@/components/ui/Kbd";
import { Search, Plus, CategoryGlyph } from "@/components/icons";
import { fmtMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const setNewExpenseOpen = useUI((s) => s.setNewExpenseOpen);
  const router = useRouter();
  const [q, setQ] = useState("");
  const expenses = useData((s) => s.expenses);
  const groups = useData((s) => s.groups);
  const users = useData((s) => s.users);
  const friends = useData((s) => s.friends);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const items: Searchable[] = useMemo(() => {
    const exp: Searchable[] = expenses.map((e) => ({
      id: e.id,
      kind: "expense",
      description: e.description,
      category: e.category ?? "",
      tags: e.tags ?? [],
      paidByName: users.find((u) => u.id === e.paidBy)?.name ?? "",
      groupName: groups.find((g) => g.id === e.groupId)?.name ?? null,
      amountCents: e.amountCents,
      currency: e.currency,
      occurredAt: e.occurredAt,
    }));
    const grp: Searchable[] = groups.map((g) => ({
      id: g.id,
      kind: "group",
      name: g.name,
      memberNames: g.memberIds.map((id) => users.find((u) => u.id === id)?.name ?? ""),
    }));
    const fr: Searchable[] = friends.map((f) => {
      const u = users.find((x) => x.id === f.id);
      return { id: f.id, kind: "friend", name: u?.name ?? "Friend", email: u?.email ?? null };
    });
    return [...exp, ...grp, ...fr];
  }, [expenses, groups, users, friends]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return runSearch(items, q, "fuzzy").slice(0, 12);
  }, [items, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh] ws-fade-in">
      <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl ws-elev shadow-[var(--shadow-lg)] ws-scale-in flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 h-12 border-b border-[var(--border)]">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search expenses, groups, friends…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-faint)]"
          />
          <Kbd>esc</Kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto ws-scroll">
          {q.trim() === "" && (
            <div className="px-2 py-2">
              <Header>Quick actions</Header>
              <Row
                icon={<Plus className="h-4 w-4 text-[var(--accent)]" />}
                title="New expense"
                hint="N"
                onClick={() => { setOpen(false); setNewExpenseOpen(true); }}
              />
              <Row title="Dashboard" hint="g d" onClick={() => { setOpen(false); router.push("/dashboard"); }} />
              <Row title="Groups" hint="g g" onClick={() => { setOpen(false); router.push("/groups"); }} />
              <Row title="Friends" hint="g f" onClick={() => { setOpen(false); router.push("/friends"); }} />
              <Row title="Settings" hint="g s" onClick={() => { setOpen(false); router.push("/settings"); }} />
              <Row title="Search…" hint="/" onClick={() => { setOpen(false); router.push("/search"); }} />
            </div>
          )}
          {q.trim() !== "" && results.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">
              No matches. Try fuzzy or regex on the <button className="text-[var(--accent)] underline" onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(q)}`); }}>full search page</button>.
            </div>
          )}
          {results.length > 0 && (
            <div className="px-2 py-2">
              <Header>Results</Header>
              {results.map((r) => {
                if (r.item.kind === "expense") {
                  return (
                    <Row
                      key={r.item.id}
                      icon={<CategoryGlyph name={r.item.category} className="h-4 w-4 text-[var(--text-muted)]" />}
                      title={r.item.description}
                      meta={`${r.item.paidByName}${r.item.groupName ? ` · ${r.item.groupName}` : ""}`}
                      right={fmtMoney(r.item.amountCents, r.item.currency)}
                      onClick={() => { setOpen(false); router.push(`/expense?id=${r.item.id}`); }}
                    />
                  );
                }
                if (r.item.kind === "group") {
                  return (
                    <Row
                      key={r.item.id}
                      icon={<span className="h-4 w-4 rounded-sm bg-[var(--accent-soft)] grid place-items-center text-[9px] text-[var(--accent-ink)] font-medium">{r.item.name[0]}</span>}
                      title={r.item.name}
                      meta={r.item.memberNames.slice(0, 4).join(", ")}
                      onClick={() => { setOpen(false); router.push(`/group?id=${r.item.id}`); }}
                    />
                  );
                }
                return (
                  <Row
                    key={r.item.id}
                    icon={<Avatar name={r.item.name} size={20} />}
                    title={r.item.name}
                    meta={r.item.email ?? "Friend"}
                    onClick={() => { setOpen(false); router.push(`/friend?id=${r.item.id}`); }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-3 py-2 flex items-center gap-3 text-[11px] text-[var(--text-faint)] bg-[var(--bg-sunk)]">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="ml-auto">fuzzy search</span>
        </div>
      </div>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--text-faint)]">{children}</div>;
}

function Row({
  icon, title, meta, right, hint, onClick,
}: {
  icon?: React.ReactNode; title: string; meta?: string; right?: string; hint?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 h-11 rounded-[var(--radius-sm)] hover:bg-[var(--bg-sunk)] transition-colors text-left"
      )}
    >
      <span className="grid place-items-center w-5 shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{title}</span>
        {meta && <span className="text-[11px] text-[var(--text-faint)] truncate block">{meta}</span>}
      </span>
      {right && <span className="text-sm tabular-nums text-[var(--text)]">{right}</span>}
      {hint && <Kbd>{hint}</Kbd>}
    </button>
  );
}

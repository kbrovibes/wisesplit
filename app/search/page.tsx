"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { useData } from "@/lib/store/data";
import { search as runSearch, type Searchable, type SearchMode } from "@/lib/search/engine";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryGlyph, Search as SearchIcon } from "@/components/icons";
import Link from "next/link";
import { fmtDate, fmtMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/ui/EmptyState";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const expenses = useData((s) => s.expenses);
  const groups = useData((s) => s.groups);
  const users = useData((s) => s.users);
  const friends = useData((s) => s.friends);

  const [q, setQ] = useState(params.get("q") ?? "");
  const [mode, setMode] = useState<SearchMode>((params.get("mode") as SearchMode) || "fuzzy");

  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (mode !== "fuzzy") sp.set("mode", mode);
    router.replace(`/search?${sp.toString()}`);
  }, [q, mode, router]);

  const items: Searchable[] = useMemo(() => {
    const exp: Searchable[] = expenses.map((e) => ({
      id: e.id, kind: "expense", description: e.description, category: e.category ?? "",
      tags: e.tags ?? [], paidByName: users.find((u) => u.id === e.paidBy)?.name ?? "",
      groupName: groups.find((g) => g.id === e.groupId)?.name ?? null,
      amountCents: e.amountCents, currency: e.currency, occurredAt: e.occurredAt,
    }));
    const grp: Searchable[] = groups.map((g) => ({
      id: g.id, kind: "group", name: g.name,
      memberNames: g.memberIds.map((id) => users.find((u) => u.id === id)?.name ?? ""),
    }));
    const fr: Searchable[] = friends.map((f) => {
      const u = users.find((x) => x.id === f.id);
      return { id: f.id, kind: "friend", name: u?.name ?? "", email: u?.email ?? null };
    });
    return [...exp, ...grp, ...fr];
  }, [expenses, groups, users, friends]);

  const results = useMemo(() => (q.trim() ? runSearch(items, q, mode) : []), [items, q, mode]);

  const expenseResults = results.filter((r) => r.item.kind === "expense");
  const groupResults = results.filter((r) => r.item.kind === "group");
  const friendResults = results.filter((r) => r.item.kind === "friend");

  return (
    <AppShell title="Search" subtitle="Substring, fuzzy, or regex. Across every expense, group, and friend.">
      <div className="flex flex-col gap-4">
        <div className="ws-card p-3 flex items-center gap-2">
          <SearchIcon className="h-4 w-4 text-[var(--text-muted)] ml-2"/>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={mode === "regex" ? "Regex pattern (case-insensitive)" : "Search…"}
            className="flex-1 h-10 bg-transparent outline-none text-sm"
          />
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-sunk)] rounded-[var(--radius-md)] text-xs">
            {(["text", "fuzzy", "regex"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "h-7 px-3 rounded-[var(--radius-sm)] capitalize",
                  mode === m ? "bg-[var(--bg-elev)] text-[var(--text)] shadow-[var(--shadow-sm)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >{m}</button>
            ))}
          </div>
        </div>

        {q.trim() === "" && (
          <EmptyState title="Search anything" description={`Try "dinner", a date, a friend, or a regex like ^Coff.* in regex mode.`} />
        )}

        {q.trim() !== "" && results.length === 0 && (
          <EmptyState title="No matches" description={mode === "regex" ? "Pattern is invalid or matched nothing." : "Try a different query, or switch to fuzzy."} />
        )}

        {expenseResults.length > 0 && (
          <Section title={`Expenses (${expenseResults.length})`}>
            <div className="ws-card p-2">
              <div className="divide-y divide-[var(--border)]">
                {expenseResults.map((r) => {
                  if (r.item.kind !== "expense") return null;
                  return (
                    <Link key={r.item.id} href={`/expense?id=${r.item.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-[var(--bg-sunk)] rounded-[var(--radius-md)]">
                      <div className="h-9 w-9 rounded-[var(--radius-md)] grid place-items-center bg-[var(--bg-sunk)] text-[var(--text-muted)]">
                        <CategoryGlyph name={r.item.category} className="h-4 w-4"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.item.description}</p>
                        <p className="text-[11px] text-[var(--text-faint)]">{r.item.paidByName}{r.item.groupName ? ` · ${r.item.groupName}` : ""} · {fmtDate(r.item.occurredAt, "relative")}</p>
                      </div>
                      <span className="text-sm tabular-nums">{fmtMoney(r.item.amountCents, r.item.currency)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {groupResults.length > 0 && (
          <Section title={`Groups (${groupResults.length})`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupResults.map((r) => r.item.kind === "group" && (
                <Link key={r.item.id} href={`/group?id=${r.item.id}`} className="ws-card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-md)]">
                  <span className="h-9 w-9 rounded-[var(--radius-md)] grid place-items-center bg-[var(--accent-soft)] text-[var(--accent-ink)] font-medium">{r.item.name[0]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.item.name}</p>
                    <p className="text-[11px] text-[var(--text-faint)] truncate">{r.item.memberNames.join(", ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {friendResults.length > 0 && (
          <Section title={`Friends (${friendResults.length})`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {friendResults.map((r) => r.item.kind === "friend" && (
                <Link key={r.item.id} href={`/friend?id=${r.item.id}`} className="ws-card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-md)]">
                  <Avatar name={r.item.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.item.name}</p>
                    <p className="text-[11px] text-[var(--text-faint)] truncate">{r.item.email ?? "Friend"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">{title}</h2>
      {children}
    </div>
  );
}

export default function SearchRoute() {
  return <Suspense fallback={null}><SearchInner /></Suspense>;
}

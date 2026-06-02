"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { ledgersFor } from "@/lib/balances";
import { fmtMoney, fmtMoneySigned } from "@/lib/utils/format";
import { Spark } from "@/components/charts/Spark";
import { Donut } from "@/components/charts/Donut";
import { ExpenseRow } from "@/components/expense/ExpenseRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyExpenses, Settled } from "@/components/illustrations";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowRight, CategoryGlyph } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { useUI } from "@/lib/store/ui";
import { Badge } from "@/components/ui/Badge";

export default function Dashboard() {
  const me = useMe();
  const expenses = useData((s) => s.expenses);
  const payments = useData((s) => s.payments);
  const users = useData((s) => s.users);
  const groups = useData((s) => s.groups);
  const friends = useData((s) => s.friends);
  const setNewExpenseOpen = useUI((s) => s.setNewExpenseOpen);

  const allParticipants = useMemo(() => {
    const ids = new Set<string>([me.id]);
    expenses.forEach((e) => { ids.add(e.paidBy); e.splits.forEach((s) => ids.add(s.userId)); });
    payments.forEach((p) => { ids.add(p.fromUser); ids.add(p.toUser); });
    return [...ids];
  }, [expenses, payments, me.id]);

  const ledgers = useMemo(() => ledgersFor(allParticipants, expenses, payments), [allParticipants, expenses, payments]);

  const myTotals = ledgers
    .map((l) => ({ currency: l.currency, cents: l.balances.find((b) => b.userId === me.id)?.cents ?? 0 }))
    .filter((x) => x.cents !== 0);

  const owedTo = myTotals.filter((x) => x.cents > 0).reduce((s, x) => s + x.cents, 0);
  const owedBy = myTotals.filter((x) => x.cents < 0).reduce((s, x) => s + Math.abs(x.cents), 0);

  // Per-person quick balances (in USD bucket where possible)
  const perPerson = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of ledgers) {
      for (const b of l.balances) {
        if (b.userId === me.id || b.cents === 0) continue;
        // sign relative to me: if I'm owed (my balance positive), counterparty is negative; we flip for display
        map.set(b.userId, (map.get(b.userId) ?? 0) + -b.cents);
      }
    }
    return [...map.entries()].map(([id, cents]) => ({ id, cents })).sort((a, b) => Math.abs(b.cents) - Math.abs(a.cents));
  }, [ledgers, me.id]);

  // Last 7 days spend (your share)
  const last7 = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i)); d.setHours(0,0,0,0); return d;
    });
    const buckets = days.map(() => 0);
    for (const e of expenses) {
      const d = new Date(e.occurredAt); d.setHours(0,0,0,0);
      const idx = days.findIndex((dd) => dd.getTime() === d.getTime());
      if (idx === -1) continue;
      const mySplit = e.splits.find((s) => s.userId === me.id)?.shareCents ?? 0;
      buckets[idx] += mySplit;
    }
    return buckets;
  }, [expenses, me.id]);

  // Category split (your spend)
  const catSlices = useMemo(() => {
    const palette = ["#5b6cff", "#7c5bff", "#1a9a6c", "#ff7a59", "#0ea5e9", "#b58105", "#e879f9", "#f43f5e", "#34d399", "#94a3b8"];
    const m = new Map<string, number>();
    for (const e of expenses) {
      const mine = e.splits.find((s) => s.userId === me.id)?.shareCents ?? 0;
      if (!mine) continue;
      const k = e.category ?? "Other";
      m.set(k, (m.get(k) ?? 0) + mine);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
  }, [expenses, me.id]);

  const recent = useMemo(() => [...expenses].slice(0, 6), [expenses]);

  return (
    <AppShell title={`${greeting()}, ${me.name.split(" ")[0]}.`} subtitle={`${expenses.length} expenses across ${groups.length} groups`}>
      <div className="flex flex-col gap-6">
        {/* balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <BalanceCard
            label="You are owed"
            cents={owedTo}
            currency={(myTotals.find((x) => x.cents > 0)?.currency) ?? "USD"}
            tone="positive"
          />
          <BalanceCard
            label="You owe"
            cents={owedBy}
            currency={(myTotals.find((x) => x.cents < 0)?.currency) ?? "USD"}
            tone="negative"
          />
          <div className="ws-card p-5 flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Net by currency</span>
            <div className="mt-2 flex-1 flex flex-col gap-1">
              {myTotals.length === 0 && (
                <span className="text-[var(--text-faint)] text-sm flex-1 grid place-items-center">All settled</span>
              )}
              {myTotals.map((t) => (
                <div key={t.currency} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">{t.currency}</span>
                  <span className={`text-sm tabular-nums font-semibold ${t.cents > 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{fmtMoneySigned(t.cents, t.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="ws-card p-5 lg:col-span-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Your spend · last 14 days</span>
              <span className="text-[11px] text-[var(--text-faint)]">your share only</span>
            </div>
            <div className="mt-3 -mx-1">
              <Spark values={last7} width={620} height={96} className="w-full h-24" />
            </div>
          </div>
          <div className="ws-card p-5">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Where it goes</span>
            <div className="mt-3 flex items-center justify-center">
              {catSlices.length > 0 ? <Donut slices={catSlices} size={140} thickness={18} /> : <span className="text-sm text-[var(--text-faint)] py-6">No data yet</span>}
            </div>
          </div>
        </div>

        {/* recent activity + balances */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3">
          <div className="ws-card p-2">
            <div className="flex items-center justify-between px-3 pt-2 pb-1">
              <h2 className="font-display text-base font-semibold tracking-tight">Recent activity</h2>
              <Link href="/activity" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1">All <ArrowRight className="h-3 w-3"/></Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                illustration={<EmptyExpenses className="h-32" />}
                title="Nothing logged yet"
                description="Add your first expense and we'll keep track from here."
                action={<Button variant="primary" onClick={() => setNewExpenseOpen(true)}><Plus className="h-4 w-4"/> Add expense</Button>}
              />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recent.map((e) => <ExpenseRow key={e.id} expense={e} />)}
              </div>
            )}
          </div>

          <div className="ws-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold tracking-tight">Balances</h2>
              <Link href="/friends" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1">All <ArrowRight className="h-3 w-3"/></Link>
            </div>
            {perPerson.length === 0 ? (
              <EmptyState illustration={<Settled className="h-28" />} title="Everyone's settled" description="Beautiful balance." />
            ) : (
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {perPerson.slice(0, 6).map((p) => {
                  const u = users.find((x) => x.id === p.id);
                  return (
                    <li key={p.id}>
                      <Link href={`/friend?id=${p.id}`} className="flex items-center gap-3 py-2.5 group">
                        <Avatar name={u?.name} size={32} />
                        <span className="text-sm flex-1 truncate">{u?.name}</span>
                        <span className={`text-sm tabular-nums font-semibold ${p.cents > 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                          {p.cents > 0 ? "owes you " : "you owe "}{fmtMoney(Math.abs(p.cents))}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* groups */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-base font-semibold tracking-tight">Your groups</h2>
            <Link href="/groups" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1">All <ArrowRight className="h-3 w-3"/></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((g) => {
              const groupExpenses = expenses.filter((e) => e.groupId === g.id);
              const total = groupExpenses.reduce((s, e) => s + e.amountCents, 0);
              return (
                <Link key={g.id} href={`/group?id=${g.id}`} className="ws-card p-4 hover:shadow-[var(--shadow-md)] transition-shadow group">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-[var(--radius-md)] grid place-items-center text-white text-sm font-medium" style={{ background: g.color }}>
                      {(g.name)[0].toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{g.name}</p>
                      <p className="text-[11px] text-[var(--text-faint)] truncate">{g.memberIds.length} members · {groupExpenses.length} expenses</p>
                    </div>
                    <Badge variant="neutral">{fmtMoney(total, groupExpenses[0]?.currency ?? "USD")}</Badge>
                  </div>
                </Link>
              );
            })}
            {groups.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No groups yet"
                  description="Create a group to share recurring expenses with the same people."
                  action={<Link href="/groups"><Button variant="primary"><Plus className="h-4 w-4"/> Create a group</Button></Link>}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function BalanceCard({ label, cents, currency, tone }: { label: string; cents: number; currency: string; tone: "positive" | "negative" }) {
  return (
    <div className="ws-card p-5">
      <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</span>
      <p className={`font-display text-3xl font-semibold tracking-tight tabular-nums mt-1.5 ${tone === "positive" ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
        {fmtMoney(cents, currency)}
      </p>
      <p className="text-[11px] text-[var(--text-faint)] mt-1">across all friends and groups</p>
    </div>
  );
}

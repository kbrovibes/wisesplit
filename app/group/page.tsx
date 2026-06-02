"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { ledgersFor } from "@/lib/balances";
import { Tabs } from "@/components/ui/Tabs";
import { ExpenseRow } from "@/components/expense/ExpenseRow";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { fmtMoney, fmtMoneySigned } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyExpenses, Settled } from "@/components/illustrations";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Plus, Share } from "@/components/icons";
import { useUI } from "@/lib/store/ui";
import { toast } from "@/components/ui/Toast";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";

function GroupPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const me = useMe();
  const groups = useData((s) => s.groups);
  const users = useData((s) => s.users);
  const expenses = useData((s) => s.expenses);
  const payments = useData((s) => s.payments);
  const updateGroup = useData((s) => s.updateGroup);
  const setNewExpenseOpen = useUI((s) => s.setNewExpenseOpen);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const group = groups.find((g) => g.id === id);
  const groupExpenses = useMemo(() => expenses.filter((e) => e.groupId === id), [expenses, id]);
  const groupPayments = useMemo(() => payments.filter((p) => p.groupId === id), [payments, id]);
  const ledgers = useMemo(() => ledgersFor(group?.memberIds ?? [], groupExpenses, groupPayments), [group, groupExpenses, groupPayments]);

  if (!group) {
    return (
      <AppShell title="Group">
        <EmptyState title="Group not found" description="It may have been removed." action={<Link href="/groups"><Button variant="primary">Back to groups</Button></Link>} />
      </AppShell>
    );
  }

  const total = groupExpenses.reduce((s, e) => s + e.amountCents, 0);
  const cur = groupExpenses[0]?.currency ?? "USD";
  const memberNames = group.memberIds.map((m) => users.find((u) => u.id === m)?.name ?? "?");

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: group.name, text: `Join ${group.name} on wisesplit`, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch { toast("Copy failed", { tone: "error" }); }
  };

  return (
    <AppShell
      title={group.name}
      subtitle={`${group.memberIds.length} members · ${groupExpenses.length} expenses · ${fmtMoney(total, cur)}`}
    >
      <div className="flex flex-col gap-5">
        <div className="ws-card p-5 flex items-center gap-4 flex-wrap">
          <span className="h-12 w-12 rounded-[var(--radius-lg)] grid place-items-center text-white text-lg font-semibold" style={{ background: group.color }}>
            {group.name[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold tracking-tight">{group.name}</h2>
              <button onClick={() => { setRenameValue(group.name); setRenameOpen(true); }} className="text-[11px] text-[var(--text-faint)] hover:text-[var(--text)] underline-offset-2 hover:underline">rename</button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{memberNames.join(", ")}</p>
          </div>
          <AvatarStack names={memberNames} size={28} max={6} />
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={share} variant="secondary"><Share className="h-4 w-4"/> Invite</Button>
            <Button onClick={() => setNewExpenseOpen(true)} variant="primary"><Plus className="h-4 w-4"/> Add expense</Button>
          </div>
        </div>

        <Tabs
          items={[
            {
              id: "exp",
              label: "Expenses",
              content: groupExpenses.length === 0 ? (
                <EmptyState illustration={<EmptyExpenses className="w-52 h-36" />} title="No expenses yet" description="Add the first one — split it any way you like." action={<Button onClick={() => setNewExpenseOpen(true)} variant="primary"><Plus className="h-4 w-4"/> Add expense</Button>} />
              ) : (
                <div className="ws-card p-2">
                  <div className="divide-y divide-[var(--border)]">
                    {groupExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
                  </div>
                </div>
              ),
            },
            {
              id: "bal",
              label: "Balances",
              content: (
                <div className="ws-card p-5">
                  {ledgers.length === 0 ? (
                    <EmptyState illustration={<Settled className="h-32"/>} title="Nothing to settle" description="All members are even." />
                  ) : (
                    <div className="flex flex-col gap-4">
                      {ledgers.map((l) => (
                        <div key={l.currency}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">{l.currency} balances</span>
                          </div>
                          <ul className="divide-y divide-[var(--border)]">
                            {l.balances.filter((b) => b.cents !== 0).sort((a, b) => Math.abs(b.cents) - Math.abs(a.cents)).map((b) => {
                              const u = users.find((x) => x.id === b.userId);
                              return (
                                <li key={b.userId} className="flex items-center gap-3 py-2.5">
                                  <Avatar name={u?.name} size={28} />
                                  <span className="text-sm flex-1 truncate">{u?.name}</span>
                                  <span className={`text-sm tabular-nums font-medium ${b.cents > 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{fmtMoneySigned(b.cents, l.currency)}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              id: "settle",
              label: "Settle up",
              content: (
                <div className="ws-card p-5">
                  {ledgers.flatMap((l) => l.transfers).length === 0 ? (
                    <EmptyState illustration={<Settled className="h-32"/>} title="All settled" description="Beautifully balanced. As all things should be." />
                  ) : (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[var(--text-muted)]">Suggested transfers — the minimum set we found to settle everyone.</p>
                      {ledgers.map((l) => (
                        l.transfers.length > 0 && (
                          <div key={l.currency}>
                            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">{l.currency}</div>
                            <ul className="space-y-2">
                              {l.transfers.map((t, i) => {
                                const from = users.find((u) => u.id === t.from);
                                const to = users.find((u) => u.id === t.to);
                                return (
                                  <li key={i} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2">
                                    <Avatar name={from?.name} size={26} />
                                    <span className="text-sm font-medium">{from?.name}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)] mx-1" />
                                    <Avatar name={to?.name} size={26} />
                                    <span className="text-sm font-medium">{to?.name}</span>
                                    <span className="ml-auto text-sm tabular-nums font-semibold">{fmtMoney(t.cents, l.currency)}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename group"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { updateGroup(group.id, { name: renameValue }); setRenameOpen(false); }}>Save</Button>
          </>
        }
      >
        <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
      </Dialog>
    </AppShell>
  );
}

export default function GroupRoute() {
  return (
    <Suspense fallback={null}>
      <GroupPage />
    </Suspense>
  );
}

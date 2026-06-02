"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { useData } from "@/lib/store/data";
import { ExpenseRow } from "@/components/expense/ExpenseRow";
import { fmtDate, fmtMoney } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { Wallet } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyExpenses } from "@/components/illustrations";

export default function ActivityPage() {
  const expenses = useData((s) => s.expenses);
  const payments = useData((s) => s.payments);
  const users = useData((s) => s.users);

  const merged = useMemo(() => {
    type Item = { kind: "expense"; at: string; el: React.ReactNode } | { kind: "payment"; at: string; el: React.ReactNode };
    const items: Item[] = [];
    for (const e of expenses) {
      items.push({ kind: "expense", at: e.occurredAt, el: <ExpenseRow key={e.id} expense={e} /> });
    }
    for (const p of payments) {
      const from = users.find((u) => u.id === p.fromUser);
      const to = users.find((u) => u.id === p.toUser);
      items.push({
        kind: "payment", at: p.occurredAt,
        el: (
          <div key={p.id} className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-sunk)]">
            <div className="h-9 w-9 rounded-[var(--radius-md)] grid place-items-center bg-[var(--positive-soft)] text-[var(--positive)] shrink-0">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Avatar name={from?.name} size={16} />
                <span className="text-sm font-medium">{from?.name}</span>
                <span className="text-xs text-[var(--text-faint)]">paid</span>
                <Avatar name={to?.name} size={16} />
                <span className="text-sm font-medium">{to?.name}</span>
              </div>
              <div className="text-[11px] text-[var(--text-faint)] mt-0.5">{p.note ?? "Payment recorded"} · {fmtDate(p.occurredAt, "relative")}</div>
            </div>
            <span className="text-sm tabular-nums font-semibold text-[var(--positive)]">{fmtMoney(p.amountCents, p.currency)}</span>
          </div>
        ),
      });
    }
    items.sort((a, b) => +new Date(b.at) - +new Date(a.at));
    return items;
  }, [expenses, payments, users]);

  return (
    <AppShell title="Activity" subtitle="Everything across all groups, newest first">
      {merged.length === 0 ? (
        <EmptyState illustration={<EmptyExpenses className="w-56 h-40" />} title="Nothing yet" description="Activity will appear here as expenses and payments happen." />
      ) : (
        <div className="ws-card p-2">
          <div className="divide-y divide-[var(--border)]">
            {merged.map((it, i) => <div key={i} className="px-1">{it.el}</div>)}
          </div>
        </div>
      )}
    </AppShell>
  );
}

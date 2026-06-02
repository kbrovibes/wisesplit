"use client";

import Link from "next/link";
import { CategoryGlyph } from "@/components/icons";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { fmtDate, fmtMoney } from "@/lib/utils/format";
import { useData, type Expense } from "@/lib/store/data";
import { cn } from "@/lib/utils/cn";

export function ExpenseRow({ expense, compact }: { expense: Expense; compact?: boolean }) {
  const users = useData((s) => s.users);
  const groups = useData((s) => s.groups);
  const meId = useData((s) => s.meId);

  const payer = users.find((u) => u.id === expense.paidBy);
  const group = groups.find((g) => g.id === expense.groupId);
  const mySplit = expense.splits.find((s) => s.userId === meId)?.shareCents ?? 0;
  const youPaid = expense.paidBy === meId;
  const yourShare = youPaid ? expense.amountCents - mySplit : -mySplit;

  return (
    <Link
      href={`/expense?id=${expense.id}`}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-sunk)] transition-colors group",
        compact && "py-2"
      )}
    >
      <div className="h-9 w-9 rounded-[var(--radius-md)] grid place-items-center bg-[var(--bg-sunk)] text-[var(--text-muted)] shrink-0">
        <CategoryGlyph name={expense.category} className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate text-[var(--text)]">{expense.description}</span>
          {group && <span className="text-[11px] text-[var(--text-faint)] truncate">· {group.name}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Avatar name={payer?.name} size={14} />
          <span className="text-[11px] text-[var(--text-muted)]">{youPaid ? "You" : payer?.name} paid {fmtMoney(expense.amountCents, expense.currency)}</span>
          <span className="text-[11px] text-[var(--text-faint)]">· {fmtDate(expense.occurredAt, "relative")}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div
          className={cn(
            "text-sm font-semibold tabular-nums",
            yourShare > 0 ? "text-[var(--positive)]" : yourShare < 0 ? "text-[var(--negative)]" : "text-[var(--text-muted)]"
          )}
        >
          {yourShare > 0 ? "+" : yourShare < 0 ? "−" : ""}{fmtMoney(Math.abs(yourShare), expense.currency)}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">
          {yourShare > 0 ? "you lent" : yourShare < 0 ? "you owe" : "settled"}
        </div>
      </div>
    </Link>
  );
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (!expenses.length) return null;
  return (
    <div className="divide-y divide-[var(--border)] -mx-2">
      {expenses.map((e) => <div key={e.id} className="px-2"><ExpenseRow expense={e} /></div>)}
    </div>
  );
}

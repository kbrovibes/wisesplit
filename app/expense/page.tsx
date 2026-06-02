"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CategoryGlyph, Edit, Trash, ChevronLeft, Send } from "@/components/icons";
import { fmtDate, fmtMoney } from "@/lib/utils/format";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";

function ExpenseInner() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const me = useMe();
  const expenses = useData((s) => s.expenses);
  const groups = useData((s) => s.groups);
  const users = useData((s) => s.users);
  const removeExpense = useData((s) => s.removeExpense);
  const comments = useData((s) => s.comments);
  const addComment = useData((s) => s.addComment);
  const expense = expenses.find((e) => e.id === id);
  const [draft, setDraft] = useState("");

  if (!expense) {
    return (
      <AppShell title="Expense">
        <EmptyState title="Expense not found" action={<Link href="/dashboard"><Button variant="primary">Back to dashboard</Button></Link>} />
      </AppShell>
    );
  }
  const payer = users.find((u) => u.id === expense.paidBy);
  const group = groups.find((g) => g.id === expense.groupId);
  const expenseComments = comments.filter((c) => c.expenseId === expense.id);

  const submitComment = () => {
    if (!draft.trim()) return;
    addComment({ expenseId: expense.id, author: me.id, body: draft.trim() });
    setDraft("");
  };

  const removeIt = () => {
    if (!confirm("Delete this expense?")) return;
    removeExpense(expense.id);
    toast("Expense deleted");
    router.back();
  };

  return (
    <AppShell title={expense.description} subtitle={group?.name ?? "1-on-1 expense"}>
      <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
        <Button variant="ghost" onClick={() => router.back()} className="self-start !px-0"><ChevronLeft className="h-4 w-4"/> Back</Button>

        <div className="ws-card p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-[var(--radius-md)] grid place-items-center bg-[var(--bg-sunk)] text-[var(--text-muted)]">
              <CategoryGlyph name={expense.category} className="h-5 w-5"/>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold tracking-tight truncate">{expense.description}</h2>
              <p className="text-xs text-[var(--text-muted)]">{expense.category ?? "Other"} · {fmtDate(expense.occurredAt, "long")}</p>
            </div>
            <span className="font-display text-2xl font-semibold tabular-nums">{fmtMoney(expense.amountCents, expense.currency)}</span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <Avatar name={payer?.name} size={28} />
            <span><span className="font-medium">{payer?.name}</span> paid {fmtMoney(expense.amountCents, expense.currency)}</span>
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] divide-y divide-[var(--border)]">
            {expense.splits.map((s) => {
              const u = users.find((x) => x.id === s.userId);
              return (
                <div key={s.userId} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar name={u?.name} size={24} />
                  <span className="text-sm flex-1 truncate">{u?.name}</span>
                  <span className="text-sm tabular-nums">{fmtMoney(s.shareCents, expense.currency)}</span>
                </div>
              );
            })}
          </div>

          {expense.notes && (
            <p className="mt-4 text-sm text-[var(--text-muted)] whitespace-pre-wrap">{expense.notes}</p>
          )}

          <div className="mt-5 flex items-center gap-2">
            <Button variant="secondary"><Edit className="h-4 w-4"/> Edit</Button>
            <Button variant="ghost" onClick={removeIt} className="text-[var(--negative)] hover:bg-[var(--negative-soft)]"><Trash className="h-4 w-4"/> Delete</Button>
          </div>
        </div>

        <div className="ws-card p-5">
          <h3 className="font-display text-base font-semibold tracking-tight mb-3">Comments</h3>
          {expenseComments.length === 0 ? (
            <p className="text-sm text-[var(--text-faint)]">No comments yet.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {expenseComments.map((c) => {
                const u = users.find((x) => x.id === c.author);
                return (
                  <li key={c.id} className="flex gap-3">
                    <Avatar name={u?.name} size={28} />
                    <div>
                      <p className="text-sm"><span className="font-medium">{u?.name}</span> <span className="text-[11px] text-[var(--text-faint)] ml-1">{fmtDate(c.createdAt, "relative")}</span></p>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">{c.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note…" onKeyDown={(e) => e.key === "Enter" && submitComment()} />
            <Button onClick={submitComment} variant="primary" size="icon" aria-label="Send"><Send className="h-4 w-4"/></Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ExpenseRoute() {
  return <Suspense fallback={null}><ExpenseInner /></Suspense>;
}

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { ledgersFor } from "@/lib/balances";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Bell, Plus, Send, Wallet } from "@/components/icons";
import { fmtMoney } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExpenseRow } from "@/components/expense/ExpenseRow";
import { useUI } from "@/lib/store/ui";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { shareReminder } from "@/lib/reminders";
import { toast } from "@/components/ui/Toast";
import type { CurrencyCode } from "@/lib/currency";

function FriendInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const me = useMe();
  const users = useData((s) => s.users);
  const expenses = useData((s) => s.expenses);
  const payments = useData((s) => s.payments);
  const addPayment = useData((s) => s.addPayment);
  const setNewExpenseOpen = useUI((s) => s.setNewExpenseOpen);

  const friend = users.find((u) => u.id === id);

  const myExpenses = useMemo(() => expenses.filter((e) => {
    const involves = e.splits.some((s) => s.userId === id) || e.paidBy === id;
    return involves && e.splits.some((s) => s.userId === me.id);
  }), [expenses, id, me.id]);

  const myPayments = useMemo(() => payments.filter((p) =>
    (p.fromUser === me.id && p.toUser === id) || (p.fromUser === id && p.toUser === me.id)
  ), [payments, id, me.id]);

  const ledger = useMemo(() => ledgersFor([me.id, id ?? ""], myExpenses, myPayments), [myExpenses, myPayments, me.id, id]);

  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payCurrency, setPayCurrency] = useState<CurrencyCode>("USD");
  const [payNote, setPayNote] = useState("");

  const [remindOpen, setRemindOpen] = useState(false);

  if (!friend) {
    return (
      <AppShell title="Friend">
        <EmptyState title="Friend not found" action={<Link href="/friends"><Button variant="primary">Back</Button></Link>} />
      </AppShell>
    );
  }

  const recordPayment = async () => {
    const cents = Math.round(Number(payAmount.replace(/[^\d.]/g, "")) * 100);
    if (cents <= 0) return;
    addPayment({
      fromUser: me.id,
      toUser: friend.id,
      amountCents: cents,
      currency: payCurrency,
      note: payNote || undefined,
      occurredAt: new Date().toISOString(),
      groupId: null,
    });
    setPayOpen(false);
    setPayAmount(""); setPayNote("");
    toast("Payment recorded", { tone: "success" });
  };

  const sendReminder = async () => {
    const total = ledger.reduce((s, l) => {
      const myBal = l.balances.find((b) => b.userId === me.id)?.cents ?? 0;
      return s + (myBal > 0 ? myBal : 0);
    }, 0);
    if (total <= 0) { toast("Nothing to remind about"); return; }
    const main = ledger.find((l) => (l.balances.find((b) => b.userId === me.id)?.cents ?? 0) > 0);
    const result = await shareReminder({
      toName: friend.name,
      toEmail: friend.email ?? null,
      fromName: me.name,
      amountCents: main?.balances.find((b) => b.userId === me.id)?.cents ?? 0,
      currency: (main?.currency ?? "USD") as CurrencyCode,
    });
    toast(result === "shared" ? "Reminder shared" : result === "copied" ? "Reminder copied" : "Opening email…", { tone: "success" });
    setRemindOpen(false);
  };

  return (
    <AppShell title={friend.name} subtitle={friend.email ?? "Direct splits"}>
      <div className="flex flex-col gap-5">
        <div className="ws-card p-5 flex items-center gap-4 flex-wrap">
          <Avatar name={friend.name} size={56} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold tracking-tight">{friend.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">{friend.email ?? "No email on file"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ledger.map((l) => {
                const myBal = l.balances.find((b) => b.userId === me.id)?.cents ?? 0;
                if (myBal === 0) return <span key={l.currency} className="text-xs text-[var(--text-faint)]">{l.currency} · settled</span>;
                return (
                  <span key={l.currency} className={`text-sm tabular-nums font-semibold ${myBal > 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                    {myBal > 0 ? `${friend.name.split(" ")[0]} owes you ` : `You owe ${friend.name.split(" ")[0]} `}{fmtMoney(Math.abs(myBal), l.currency)}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => setPayOpen(true)} variant="secondary"><Wallet className="h-4 w-4"/> Record payment</Button>
            <Button onClick={() => setRemindOpen(true)} variant="secondary"><Bell className="h-4 w-4"/> Remind</Button>
            <Button onClick={() => setNewExpenseOpen(true)} variant="primary"><Plus className="h-4 w-4"/> Add expense</Button>
          </div>
        </div>

        <div className="ws-card p-2">
          <div className="px-3 pt-2 pb-1">
            <h2 className="font-display text-base font-semibold tracking-tight">Shared expenses</h2>
          </div>
          {myExpenses.length === 0 ? (
            <EmptyState title="Nothing shared yet" description="Add an expense and we'll keep score." action={<Button onClick={() => setNewExpenseOpen(true)} variant="primary"><Plus className="h-4 w-4"/> Add expense</Button>} />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {myExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Record a payment"
        description={`From you to ${friend.name}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={recordPayment}>Save payment</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <Label>Amount</Label>
            <div className="flex gap-2 mt-1.5">
              <select
                value={payCurrency}
                onChange={(e) => setPayCurrency(e.target.value as CurrencyCode)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] text-sm px-2 w-24"
              >
                {["USD","EUR","GBP","INR","JPY"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" inputMode="decimal" autoFocus />
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Venmo'd, cash, etc." className="mt-1.5" rows={2} />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={remindOpen}
        onClose={() => setRemindOpen(false)}
        title="Send a friendly reminder"
        description="We'll prepare the message — your email client (or Web Share) actually sends it."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemindOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={sendReminder}><Send className="h-4 w-4"/> Send</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          We'll open your share sheet (or your mail client as a fallback) pre-filled with a polite note about the outstanding balance.
        </p>
      </Dialog>
    </AppShell>
  );
}

export default function FriendRoute() {
  return <Suspense fallback={null}><FriendInner /></Suspense>;
}

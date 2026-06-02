import { computeBalances, minimizeTransfers, type Balance, type Transfer } from "@/lib/debt/minimize";
import type { Expense, Payment } from "@/lib/store/data";

/** Per-currency balances + transfers. v0.1 keeps each currency separate. */
export type CurrencyLedger = { currency: string; balances: Balance[]; transfers: Transfer[] };

export function ledgersFor(
  participantIds: string[],
  expenses: Expense[],
  payments: Payment[]
): CurrencyLedger[] {
  const byCcy = new Map<string, { e: Expense[]; p: Payment[] }>();
  for (const e of expenses) {
    const k = e.currency;
    if (!byCcy.has(k)) byCcy.set(k, { e: [], p: [] });
    byCcy.get(k)!.e.push(e);
  }
  for (const p of payments) {
    const k = p.currency;
    if (!byCcy.has(k)) byCcy.set(k, { e: [], p: [] });
    byCcy.get(k)!.p.push(p);
  }

  const out: CurrencyLedger[] = [];
  for (const [ccy, { e, p }] of byCcy) {
    const balances = computeBalances(
      participantIds,
      e.map((x) => ({ paidBy: x.paidBy, splits: x.splits.map((s) => ({ userId: s.userId, shareCents: s.shareCents })) })),
      p.map((x) => ({ from: x.fromUser, to: x.toUser, cents: x.amountCents }))
    );
    const transfers = minimizeTransfers(balances);
    out.push({ currency: ccy, balances, transfers });
  }
  return out;
}

/** Sum of "you owe" / "you are owed" across all currencies, in user's home ccy.
 *  v0.1 keeps amounts in their original currency; we just bucket and total per ccy. */
export function summaryFor(meId: string, ledgers: CurrencyLedger[]) {
  return ledgers.map((l) => {
    const me = l.balances.find((b) => b.userId === meId)?.cents ?? 0;
    return { currency: l.currency, cents: me };
  });
}

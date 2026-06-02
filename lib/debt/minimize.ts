/**
 * Debt graph minimization.
 *
 * Input: per-user net balance (positive = is owed, negative = owes).
 * Output: minimum set of transactions to settle all balances.
 *
 * Greedy max-creditor / max-debtor matching. Not strictly minimum-edge in
 * pathological cases (NP-hard) but gives strong results in practice and
 * Splitwise uses essentially the same approach.
 */

export type Balance = { userId: string; cents: number };
export type Transfer = { from: string; to: string; cents: number };

export function minimizeTransfers(balances: Balance[]): Transfer[] {
  const eps = 1; // ignore sub-cent rounding noise

  // Work on a mutable copy, normalize.
  const map = new Map<string, number>();
  for (const b of balances) {
    map.set(b.userId, (map.get(b.userId) ?? 0) + b.cents);
  }
  const debtors: { id: string; v: number }[] = [];
  const creditors: { id: string; v: number }[] = [];
  for (const [id, v] of map) {
    if (v < -eps) debtors.push({ id, v: -v });
    else if (v > eps) creditors.push({ id, v });
  }

  const transfers: Transfer[] = [];
  while (debtors.length && creditors.length) {
    debtors.sort((a, b) => b.v - a.v);
    creditors.sort((a, b) => b.v - a.v);
    const d = debtors[0];
    const c = creditors[0];
    const amt = Math.min(d.v, c.v);
    if (amt < eps) break;
    transfers.push({ from: d.id, to: c.id, cents: amt });
    d.v -= amt;
    c.v -= amt;
    if (d.v < eps) debtors.shift();
    if (c.v < eps) creditors.shift();
  }
  return transfers;
}

/** Net balances given expenses + payments (single currency for now). */
export function computeBalances(
  participants: string[],
  records: { paidBy: string; splits: { userId: string; shareCents: number }[] }[],
  payments: { from: string; to: string; cents: number }[] = []
): Balance[] {
  const net = new Map<string, number>(participants.map((p) => [p, 0] as const));
  for (const r of records) {
    const total = r.splits.reduce((s, x) => s + x.shareCents, 0);
    net.set(r.paidBy, (net.get(r.paidBy) ?? 0) + total);
    for (const s of r.splits) {
      net.set(s.userId, (net.get(s.userId) ?? 0) - s.shareCents);
    }
  }
  for (const p of payments) {
    net.set(p.from, (net.get(p.from) ?? 0) + p.cents);
    net.set(p.to, (net.get(p.to) ?? 0) - p.cents);
  }
  return [...net.entries()].map(([userId, cents]) => ({ userId, cents }));
}

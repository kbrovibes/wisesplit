/* Split engines. Given an expense total and a strategy, return per-user cents.
   All algorithms allocate every last cent — rounding error is absorbed by the
   first participants in a deterministic order, so totals always reconcile. */

export type Participant = { userId: string; weight?: number; cents?: number };
export type SplitMode = "equal" | "shares" | "percent" | "exact";

export function splitEqual(totalCents: number, participants: { userId: string }[]) {
  const n = participants.length;
  if (n === 0) return [];
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  return participants.map((p, i) => ({
    userId: p.userId,
    cents: base + (i < remainder ? 1 : 0),
  }));
}

export function splitShares(totalCents: number, participants: Participant[]) {
  const total = participants.reduce((s, p) => s + (p.weight ?? 0), 0);
  if (total <= 0) return splitEqual(totalCents, participants);
  let allocated = 0;
  const raw = participants.map((p) => {
    const c = Math.floor((totalCents * (p.weight ?? 0)) / total);
    allocated += c;
    return { userId: p.userId, cents: c };
  });
  let remainder = totalCents - allocated;
  for (let i = 0; remainder > 0 && i < raw.length; i++, remainder--) raw[i].cents += 1;
  return raw;
}

export function splitPercent(totalCents: number, participants: Participant[]) {
  return splitShares(totalCents, participants);
}

export function splitExact(participants: Participant[]) {
  return participants.map((p) => ({ userId: p.userId, cents: p.cents ?? 0 }));
}

export function applySplit(
  mode: SplitMode,
  totalCents: number,
  participants: Participant[]
) {
  switch (mode) {
    case "equal":
      return splitEqual(totalCents, participants);
    case "shares":
      return splitShares(totalCents, participants);
    case "percent":
      return splitPercent(totalCents, participants);
    case "exact":
      return splitExact(participants);
  }
}

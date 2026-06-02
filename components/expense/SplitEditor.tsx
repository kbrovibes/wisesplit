"use client";

import { useMemo } from "react";
import type { ShareType, Split } from "@/lib/store/data";
import { fmtMoney } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";

type Person = { id: string; name: string };

export type SplitMode = ShareType;

type Props = {
  totalCents: number;
  currency: string;
  people: Person[];
  mode: SplitMode;
  setMode: (m: SplitMode) => void;
  splits: Split[];
  setSplits: (s: Split[]) => void;
};

export function SplitEditor({ totalCents, currency, people, mode, setMode, splits, setSplits }: Props) {
  const totalLabel = fmtMoney(totalCents, currency);

  // Auto-recalc whenever totalCents / mode / people change for equal mode.
  const computedEqual = useMemo(() => {
    if (!people.length) return [] as Split[];
    const base = Math.floor(totalCents / people.length);
    const rem = totalCents - base * people.length;
    return people.map((p, i) => ({
      userId: p.id,
      shareCents: base + (i < rem ? 1 : 0),
      shareType: "equal" as const,
      shareValue: 1,
    }));
  }, [totalCents, people]);

  const current = mode === "equal" ? computedEqual : splits.length === people.length ? splits : people.map((p) => ({
    userId: p.id, shareCents: Math.floor(totalCents / Math.max(1, people.length)), shareType: mode, shareValue: 0,
  }));

  const sum = current.reduce((s, x) => s + x.shareCents, 0);
  const diff = totalCents - sum;

  const updateValue = (userId: string, value: number) => {
    if (mode === "equal") return;
    let next = current.map((s) => s.userId === userId ? { ...s, shareValue: value } : s);
    if (mode === "exact") {
      next = next.map((s) => s.userId === userId ? { ...s, shareCents: Math.round(value * 100) } : s);
    } else if (mode === "percent") {
      const totalPct = next.reduce((acc, x) => acc + (x.shareValue ?? 0), 0);
      next = next.map((s) => ({ ...s, shareCents: Math.round(totalCents * ((s.shareValue ?? 0) / Math.max(1, totalPct))) }));
    } else if (mode === "share") {
      const totalShares = next.reduce((acc, x) => acc + (x.shareValue ?? 0), 0);
      next = next.map((s) => ({ ...s, shareCents: totalShares ? Math.round(totalCents * ((s.shareValue ?? 0) / totalShares)) : 0 }));
    }
    setSplits(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-sunk)] rounded-[var(--radius-md)] text-xs">
        {(["equal", "share", "percent", "exact"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "h-8 rounded-[var(--radius-sm)] capitalize transition-colors",
              mode === m ? "bg-[var(--bg-elev)] text-[var(--text)] shadow-[var(--shadow-sm)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {m === "equal" ? "Equal" : m === "share" ? "Shares" : m === "percent" ? "Percent" : "Exact"}
          </button>
        ))}
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--border)] divide-y divide-[var(--border)]">
        {people.map((p) => {
          const s = current.find((x) => x.userId === p.id);
          return (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={p.name} size={28} />
              <span className="text-sm flex-1 truncate">{p.name}</span>
              {mode === "equal" && (
                <span className="text-sm tabular-nums text-[var(--text)]">{fmtMoney(s?.shareCents ?? 0, currency)}</span>
              )}
              {mode === "exact" && (
                <input
                  type="number"
                  step="0.01"
                  defaultValue={((s?.shareCents ?? 0) / 100).toFixed(2)}
                  onChange={(e) => updateValue(p.id, Number(e.target.value))}
                  className="w-24 h-8 px-2 text-right text-sm rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] tabular-nums"
                />
              )}
              {mode === "share" && (
                <input
                  type="number"
                  min={0}
                  defaultValue={s?.shareValue ?? 1}
                  onChange={(e) => updateValue(p.id, Number(e.target.value))}
                  className="w-20 h-8 px-2 text-right text-sm rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] tabular-nums"
                />
              )}
              {mode === "percent" && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={s?.shareValue ?? 0}
                    onChange={(e) => updateValue(p.id, Number(e.target.value))}
                    className="w-16 h-8 px-2 text-right text-sm rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] tabular-nums"
                  />
                  <span className="text-xs text-[var(--text-muted)]">%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">Total of splits</span>
        <span className={cn("tabular-nums", Math.abs(diff) <= 1 ? "text-[var(--positive)]" : "text-[var(--negative)]")}>
          {fmtMoney(sum, currency)} of {totalLabel}
          {Math.abs(diff) > 1 && <span className="ml-1">({diff > 0 ? "+" : ""}{fmtMoney(diff, currency)} off)</span>}
        </span>
      </div>
    </div>
  );
}

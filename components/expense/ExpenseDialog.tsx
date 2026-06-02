"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { useUI } from "@/lib/store/ui";
import { useData, type ShareType, type Split } from "@/lib/store/data";
import { CATEGORIES, CategoryGlyph, Sparkle } from "@/components/icons";
import { CURRENCIES } from "@/lib/currency";
import { parseCents } from "@/lib/utils/format";
import { parseExpense } from "@/lib/nlp/parseExpense";
import { SplitEditor } from "./SplitEditor";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

export function ExpenseDialog() {
  const open = useUI((s) => s.newExpenseOpen);
  const setOpen = useUI((s) => s.setNewExpenseOpen);
  const groups = useData((s) => s.groups);
  const users = useData((s) => s.users);
  const friends = useData((s) => s.friends);
  const meId = useData((s) => s.meId);
  const addExpense = useData((s) => s.addExpense);

  const [quickText, setQuickText] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paidBy, setPaidBy] = useState(meId);
  const [category, setCategory] = useState("Food");
  const [groupId, setGroupId] = useState<string | "none">("none");
  const [participantIds, setParticipantIds] = useState<string[]>([meId]);
  const [mode, setMode] = useState<ShareType>("equal");
  const [splits, setSplits] = useState<Split[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuickText("");
    setDescription("");
    setAmount("");
    setCategory("Food");
    setGroupId("none");
    setParticipantIds([meId, ...friends.slice(0, 1).map((f) => f.id)]);
    setMode("equal");
    setSplits([]);
    setPaidBy(meId);
    setNotes("");
  }, [open, meId, friends]);

  // Group switch -> populate participants from group
  useEffect(() => {
    if (groupId === "none") return;
    const g = groups.find((x) => x.id === groupId);
    if (g) setParticipantIds(g.memberIds);
  }, [groupId, groups]);

  const people = useMemo(() => participantIds.map((id) => ({ id, name: users.find((u) => u.id === id)?.name ?? "?" })), [participantIds, users]);

  const totalCents = useMemo(() => parseCents(amount), [amount]);

  const togglePerson = (id: string) => {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleQuickParse = () => {
    if (!quickText.trim()) return;
    const p = parseExpense(quickText);
    if (p.description) setDescription(p.description);
    if (p.amountCents) setAmount((p.amountCents / 100).toString());
    if (p.currency) setCurrency(p.currency);
    if (p.category) setCategory(p.category);
    if (p.withPeople.length) {
      const matched = p.withPeople.map((needle) =>
        users.find((u) => u.id !== meId && u.name.toLowerCase().includes(needle.toLowerCase()))?.id
      ).filter(Boolean) as string[];
      if (matched.length) setParticipantIds([meId, ...matched]);
    }
    toast("Parsed", { description: "Filled in what we could." });
  };

  const submit = () => {
    if (!description.trim() || totalCents <= 0 || participantIds.length === 0) {
      toast("Missing fields", { description: "Add a description, amount, and at least one person.", tone: "error" });
      return;
    }
    const base = Math.floor(totalCents / participantIds.length);
    const rem = totalCents - base * participantIds.length;
    const finalSplits: Split[] = mode === "equal"
      ? participantIds.map((id, i) => ({ userId: id, shareCents: base + (i < rem ? 1 : 0), shareType: "equal", shareValue: 1 }))
      : splits.length === participantIds.length ? splits : participantIds.map((id) => ({ userId: id, shareCents: base, shareType: mode, shareValue: 0 }));

    addExpense({
      groupId: groupId === "none" ? null : groupId,
      paidBy,
      amountCents: totalCents,
      currency,
      description: description.trim(),
      category,
      tags: [],
      occurredAt: new Date().toISOString(),
      splits: finalSplits,
      notes: notes.trim() || undefined,
    });
    setOpen(false);
    toast("Expense added", { tone: "success" });
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="New expense"
      description="Split a bill, settle later."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Add expense</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] p-3">
          <Label hint={<span className="flex items-center gap-1 text-[var(--accent-ink)]"><Sparkle className="h-3 w-3"/> AI quick-add</span>}>Type it naturally</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              placeholder='e.g. "dinner with sam $48 yesterday"'
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleQuickParse())}
            />
            <Button onClick={handleQuickParse} variant="secondary">Parse</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tapas dinner" className="mt-1.5" />
          </div>
          <div>
            <Label>Amount</Label>
            <div className="flex gap-2 mt-1.5">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] text-sm px-2 w-24"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" inputMode="decimal" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Category</Label>
            <div className="mt-1.5 grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "h-12 rounded-[var(--radius-md)] border flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
                    category === c
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                  )}
                  title={c}
                >
                  <CategoryGlyph name={c} className="h-4 w-4" />
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Group</Label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value as string | "none")}
              className="mt-1.5 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] text-sm px-2"
            >
              <option value="none">No group (1-on-1)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <Label className="mt-3">Paid by</Label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] text-sm px-2"
            >
              {participantIds.map((id) => (
                <option key={id} value={id}>{users.find((u) => u.id === id)?.name ?? id}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Split between</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {[{ id: meId, name: users.find((u) => u.id === meId)?.name ?? "You" }, ...friends.map((f) => ({ id: f.id, name: users.find((u) => u.id === f.id)?.name ?? "Friend" }))].map((p) => {
              const on = participantIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePerson(p.id)}
                  className={cn(
                    "h-8 px-3 rounded-full text-xs border transition-colors",
                    on
                      ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]"
                      : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                  )}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {participantIds.length > 0 && totalCents > 0 && (
          <SplitEditor
            totalCents={totalCents}
            currency={currency}
            people={people}
            mode={mode}
            setMode={setMode}
            splits={splits}
            setSplits={setSplits}
          />
        )}

        <div>
          <Label>Notes <span className="text-[var(--text-faint)] normal-case ml-1">(optional)</span></Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth remembering" className="mt-1.5" />
        </div>
      </div>
    </Dialog>
  );
}

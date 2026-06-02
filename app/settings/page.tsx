"use client";

import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { useTheme } from "@/lib/store/theme";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CURRENCIES } from "@/lib/currency";
import { Download, Upload, Sun, Moon, Monitor } from "@/components/icons";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const me = useMe();
  const data = useData();
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);

  const [name, setName] = useState(me.name);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");

  const saveProfile = () => {
    data.upsertUser({ ...me, name });
    toast("Profile saved", { tone: "success" });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({
      me: me.id, users: data.users, friends: data.friends, groups: data.groups,
      expenses: data.expenses, payments: data.payments, comments: data.comments,
    }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wisesplit-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportCsv = () => {
    const header = "id,date,description,category,paidBy,amount,currency,group,participants\n";
    const rows = data.expenses.map((e) => [
      e.id, e.occurredAt, JSON.stringify(e.description), e.category ?? "",
      data.users.find((u) => u.id === e.paidBy)?.name ?? e.paidBy,
      (e.amountCents / 100).toFixed(2), e.currency,
      data.groups.find((g) => g.id === e.groupId)?.name ?? "",
      JSON.stringify(e.splits.map((s) => data.users.find((u) => u.id === s.userId)?.name ?? s.userId).join(", ")),
    ].join(","));
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wisesplit-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(String(reader.result));
        toast("Import not yet wired", { description: "Schema accepted — full import lands in v0.2.", tone: "default" });
      } catch { toast("Invalid JSON", { tone: "error" }); }
    };
    reader.readAsText(file);
  };

  const resetDemo = () => {
    if (!confirm("Reset all local data to the demo seed?")) return;
    data.resetDemo();
    toast("Demo data restored");
  };

  return (
    <AppShell title="Settings" subtitle="Profile, appearance, and your data">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 max-w-4xl">
        <section className="ws-card p-5">
          <h2 className="font-display text-base font-semibold tracking-tight">Profile</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">How you appear to other people in your groups.</p>
          <div className="mt-4 flex flex-col gap-3">
            <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
            <div>
              <Label>Default currency</Label>
              <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] text-sm px-2">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} · {c.name}</option>)}
              </select>
            </div>
            <Button onClick={saveProfile} variant="primary" className="self-start">Save profile</Button>
          </div>
        </section>

        <section className="ws-card p-5">
          <h2 className="font-display text-base font-semibold tracking-tight">Appearance</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Pick what feels good. Persists across visits.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["light", "dark", "system"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "rounded-[var(--radius-md)] border p-4 flex flex-col items-center gap-2 text-sm transition-colors",
                    theme === t ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-ink)]" : "border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-muted)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="capitalize">{t}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="ws-card p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold tracking-tight">Your data</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">It's yours. Export anytime, in JSON or CSV. wisesplit never tracks you.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={exportJson}><Download className="h-4 w-4"/> Export JSON</Button>
            <Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4"/> Export CSV</Button>
            <label className="inline-flex items-center gap-2 h-10 px-4 text-sm rounded-[var(--radius-md)] bg-[var(--bg-elev)] border border-[var(--border)] hover:bg-[var(--bg-sunk)] cursor-pointer">
              <Upload className="h-4 w-4"/> Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
            </label>
            <Button variant="ghost" onClick={resetDemo} className="text-[var(--text-muted)]">Reset to demo data</Button>
          </div>
        </section>

        <section className="ws-card p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold tracking-tight">Keyboard shortcuts</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row k="⌘K" v="Open command palette" />
            <Row k="/" v="Focus search" />
            <Row k="N" v="New expense" />
            <Row k="G then D" v="Go to dashboard" />
            <Row k="G then G" v="Go to groups" />
            <Row k="G then F" v="Go to friends" />
            <Row k="G then S" v="Go to settings" />
            <Row k="?" v="Show shortcuts" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--text-muted)]">{v}</span>
      <kbd className="px-2 h-6 grid place-items-center text-[11px] font-mono text-[var(--text)] bg-[var(--bg-sunk)] border border-[var(--border)] rounded-md">{k}</kbd>
    </div>
  );
}

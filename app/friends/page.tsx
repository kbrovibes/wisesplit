"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { ledgersFor } from "@/lib/balances";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowRight } from "@/components/icons";
import { fmtMoney } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyFriends } from "@/components/illustrations";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { nid } from "@/lib/utils/id";

export default function FriendsPage() {
  const me = useMe();
  const users = useData((s) => s.users);
  const friends = useData((s) => s.friends);
  const expenses = useData((s) => s.expenses);
  const payments = useData((s) => s.payments);
  const upsertUser = useData((s) => s.upsertUser);
  const addFriend = useData((s) => s.addFriend);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const balances = useMemo(() => {
    const ids = [me.id, ...friends.map((f) => f.id)];
    const ledger = ledgersFor(ids, expenses, payments);
    const map = new Map<string, { ccy: string; cents: number }>();
    for (const l of ledger) {
      for (const b of l.balances) {
        if (b.userId === me.id) continue;
        if (b.cents === 0) continue;
        map.set(b.userId + "_" + l.currency, { ccy: l.currency, cents: -b.cents });
      }
    }
    return map;
  }, [friends, expenses, payments, me.id]);

  const create = () => {
    if (!name.trim()) return;
    const id = nid("u");
    upsertUser({ id, name: name.trim(), email: email.trim() || undefined });
    addFriend(id);
    setOpen(false);
    setName(""); setEmail("");
  };

  return (
    <AppShell title="Friends" subtitle={`${friends.length} ${friends.length === 1 ? "friend" : "friends"}`} actions={
      <Button variant="primary" onClick={() => setOpen(true)} className="hidden sm:inline-flex"><Plus className="h-4 w-4"/> Add friend</Button>
    }>
      {friends.length === 0 ? (
        <EmptyState
          illustration={<EmptyFriends className="w-56 h-40" />}
          title="No friends yet"
          description="Add someone to start splitting bills together."
          action={<Button onClick={() => setOpen(true)} variant="primary"><Plus className="h-4 w-4"/> Add a friend</Button>}
        />
      ) : (
        <ul className="ws-card divide-y divide-[var(--border)]">
          {friends.map((f) => {
            const u = users.find((x) => x.id === f.id);
            const entries = [...balances.entries()].filter(([k]) => k.startsWith(f.id + "_"));
            return (
              <li key={f.id}>
                <Link href={`/friend?id=${f.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-sunk)] transition-colors">
                  <Avatar name={u?.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u?.name ?? "Friend"}</p>
                    <p className="text-[11px] text-[var(--text-faint)] truncate">{u?.email ?? "Direct splits only"}</p>
                  </div>
                  <div className="text-right">
                    {entries.length === 0 ? (
                      <span className="text-xs text-[var(--text-faint)]">settled</span>
                    ) : entries.map(([k, v]) => (
                      <div key={k} className={`text-sm tabular-nums font-semibold ${v.cents > 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                        {v.cents > 0 ? "owes you " : "you owe "}{fmtMoney(Math.abs(v.cents), v.ccy)}
                      </div>
                    ))}
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--text-faint)] ml-1"/>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add a friend"
        description="They don't need an account yet — you can sync up later."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={create}>Add</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sam Rivera" autoFocus className="mt-1.5" /></div>
          <div><Label>Email <span className="normal-case text-[var(--text-faint)] ml-1">(optional)</span></Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sam@example.com" className="mt-1.5" /></div>
        </div>
      </Dialog>
    </AppShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useData, useMe } from "@/lib/store/data";
import { Button } from "@/components/ui/Button";
import { Plus } from "@/components/icons";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { fmtMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyGroups } from "@/components/illustrations";
import { cn } from "@/lib/utils/cn";

const PRESETS = [
  { color: "#5b6cff", label: "Indigo" },
  { color: "#1a9a6c", label: "Forest" },
  { color: "#ff7a59", label: "Coral" },
  { color: "#0ea5e9", label: "Sky" },
  { color: "#e879f9", label: "Magenta" },
  { color: "#b58105", label: "Amber" },
];

export default function GroupsPage() {
  const me = useMe();
  const groups = useData((s) => s.groups);
  const expenses = useData((s) => s.expenses);
  const users = useData((s) => s.users);
  const friends = useData((s) => s.friends);
  const addGroup = useData((s) => s.addGroup);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESETS[0].color);
  const [memberIds, setMemberIds] = useState<string[]>([me.id]);

  const peoplePool = useMemo(() => [{ id: me.id, name: me.name }, ...friends.map((f) => ({ id: f.id, name: users.find((u) => u.id === f.id)?.name ?? "Friend" }))], [friends, users, me]);

  const create = () => {
    if (!name.trim()) return;
    addGroup({ name: name.trim(), icon: "sparkle", color, memberIds });
    setOpen(false);
    setName("");
    setColor(PRESETS[0].color);
    setMemberIds([me.id]);
  };

  return (
    <AppShell title="Groups" subtitle="Share recurring expenses with the same people" actions={
      <Button variant="primary" onClick={() => setOpen(true)} className="hidden sm:inline-flex"><Plus className="h-4 w-4" /> New group</Button>
    }>
      {groups.length === 0 ? (
        <EmptyState
          illustration={<EmptyGroups className="w-56 h-40" />}
          title="No groups yet"
          description="Roommates, trips, dinner clubs — groups let you split expenses with the same people again and again."
          action={<Button onClick={() => setOpen(true)} variant="primary"><Plus className="h-4 w-4"/> Create a group</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((g) => {
            const gx = expenses.filter((e) => e.groupId === g.id);
            const total = gx.reduce((s, e) => s + e.amountCents, 0);
            const cur = gx[0]?.currency ?? "USD";
            const names = g.memberIds.map((id) => users.find((u) => u.id === id)?.name ?? "?");
            return (
              <Link key={g.id} href={`/group?id=${g.id}`} className="ws-card p-5 hover:shadow-[var(--shadow-md)] transition-shadow flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="h-10 w-10 rounded-[var(--radius-md)] grid place-items-center text-white font-medium" style={{ background: g.color }}>
                    {g.name[0].toUpperCase()}
                  </span>
                  <Badge variant="neutral">{gx.length} expenses</Badge>
                </div>
                <div>
                  <h3 className="font-display font-semibold tracking-tight">{g.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{names.join(", ")}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
                  <AvatarStack names={names} size={22} max={4} />
                  <span className="text-sm tabular-nums font-medium">{fmtMoney(total, cur)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New group"
        description="Give your group a name. You can add and remove people later."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={create}>Create</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lisbon trip" autoFocus className="mt-1.5" />
          </div>
          <div>
            <Label>Color</Label>
            <div className="mt-1.5 flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.color}
                  aria-label={p.label}
                  onClick={() => setColor(p.color)}
                  className={cn("h-8 w-8 rounded-full transition-transform", color === p.color && "ring-2 ring-offset-2 ring-offset-[var(--bg-elev)] ring-[var(--text)]")}
                  style={{ background: p.color }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label>Members</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {peoplePool.map((p) => {
                const on = memberIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setMemberIds((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                    className={cn(
                      "h-9 pl-1 pr-3 inline-flex items-center gap-2 rounded-full border text-sm transition-colors",
                      on ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <Avatar name={p.name} size={22} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </AppShell>
  );
}

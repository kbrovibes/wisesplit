"use client";

/**
 * Local-first data layer. When Supabase isn't configured (or a user is signed
 * out), this acts as the source of truth and persists to localStorage. The
 * shape mirrors what the Supabase repository returns so we can swap upstream
 * without touching pages.
 *
 * For v0.1 we ship a richer demo dataset on first run so the app feels alive
 * the moment someone opens it.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nid } from "@/lib/utils/id";

export type User = { id: string; name: string; email?: string; color?: string };
export type Group = { id: string; name: string; icon: string; color: string; memberIds: string[]; createdAt: string };
export type Friend = { id: string };
export type ShareType = "equal" | "percent" | "share" | "exact";
export type Split = { userId: string; shareCents: number; shareType: ShareType; shareValue: number };
export type Expense = {
  id: string;
  groupId?: string | null;
  paidBy: string;
  amountCents: number;
  currency: string;
  description: string;
  category?: string;
  tags?: string[];
  occurredAt: string;
  createdBy: string;
  createdAt: string;
  splits: Split[];
  notes?: string;
};
export type Payment = {
  id: string;
  fromUser: string;
  toUser: string;
  amountCents: number;
  currency: string;
  note?: string;
  occurredAt: string;
  groupId?: string | null;
};
export type Comment = { id: string; expenseId: string; author: string; body: string; createdAt: string };

export type DataState = {
  meId: string;
  users: User[];
  friends: Friend[];
  groups: Group[];
  expenses: Expense[];
  payments: Payment[];
  comments: Comment[];

  // mutations
  setMe: (id: string) => void;
  upsertUser: (u: User) => void;
  addFriend: (id: string) => void;
  removeFriend: (id: string) => void;
  addGroup: (g: Omit<Group, "id" | "createdAt"> & { id?: string }) => Group;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  removeGroup: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "createdAt" | "createdBy"> & { createdBy?: string }) => Expense;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  addPayment: (p: Omit<Payment, "id">) => Payment;
  addComment: (c: Omit<Comment, "id" | "createdAt">) => Comment;
  resetDemo: () => void;
};

const ME = "u_me";

const DEMO_USERS: User[] = [
  { id: ME, name: "You", color: "#5b6cff" },
  { id: "u_sam", name: "Sam Patel", color: "#1a9a6c" },
  { id: "u_priya", name: "Priya Rao", color: "#ff7a59" },
  { id: "u_leo", name: "Leo Chen", color: "#0ea5e9" },
  { id: "u_maya", name: "Maya Ortiz", color: "#e879f9" },
  { id: "u_ben", name: "Ben Carter", color: "#b58105" },
];

function daysAgoISO(d: number): string {
  const t = new Date(); t.setDate(t.getDate() - d); return t.toISOString();
}

function evenSplit(total: number, users: string[]): Split[] {
  const base = Math.floor(total / users.length);
  const remainder = total - base * users.length;
  return users.map((u, i) => ({
    userId: u,
    shareCents: base + (i < remainder ? 1 : 0),
    shareType: "equal" as const,
    shareValue: 1,
  }));
}

function expense(p: {
  desc: string; cents: number; paid: string; with: string[]; cat: string; ago: number; group?: string; currency?: string; tags?: string[];
}): Expense {
  return {
    id: nid("e"),
    groupId: p.group ?? null,
    paidBy: p.paid,
    amountCents: p.cents,
    currency: p.currency ?? "USD",
    description: p.desc,
    category: p.cat,
    tags: p.tags,
    occurredAt: daysAgoISO(p.ago),
    createdBy: p.paid,
    createdAt: daysAgoISO(p.ago),
    splits: evenSplit(p.cents, [p.paid, ...p.with.filter((u) => u !== p.paid)]),
  };
}

function seed(): Pick<DataState, "users" | "friends" | "groups" | "expenses" | "payments" | "comments" | "meId"> {
  const groupTrip: Group = { id: "g_trip", name: "Lisbon Trip", icon: "plane", color: "#5b6cff", memberIds: [ME, "u_sam", "u_priya", "u_leo"], createdAt: daysAgoISO(20) };
  const groupHouse: Group = { id: "g_house", name: "Apartment 4B", icon: "home", color: "#1a9a6c", memberIds: [ME, "u_maya"], createdAt: daysAgoISO(180) };
  const groupBook: Group = { id: "g_book", name: "Book Club", icon: "book", color: "#ff7a59", memberIds: [ME, "u_ben", "u_priya"], createdAt: daysAgoISO(60) };

  const expenses: Expense[] = [
    expense({ desc: "Pasteis de nata haul", cents: 1480, paid: ME, with: ["u_sam", "u_priya", "u_leo"], cat: "Food", ago: 2, group: "g_trip", currency: "EUR", tags: ["snack", "lisbon"] }),
    expense({ desc: "Airbnb in Alfama", cents: 64000, paid: "u_sam", with: [ME, "u_priya", "u_leo"], cat: "Travel", ago: 4, group: "g_trip", currency: "EUR" }),
    expense({ desc: "Trams + metro pass", cents: 3200, paid: "u_priya", with: [ME, "u_sam", "u_leo"], cat: "Transport", ago: 4, group: "g_trip", currency: "EUR" }),
    expense({ desc: "Tapas at Time Out", cents: 8740, paid: "u_leo", with: [ME, "u_sam", "u_priya"], cat: "Food", ago: 3, group: "g_trip", currency: "EUR", tags: ["dinner"] }),
    expense({ desc: "Sintra day trip", cents: 12200, paid: ME, with: ["u_sam", "u_priya", "u_leo"], cat: "Travel", ago: 1, group: "g_trip", currency: "EUR" }),

    expense({ desc: "Rent — June", cents: 240000, paid: "u_maya", with: [ME], cat: "Home", ago: 5, group: "g_house" }),
    expense({ desc: "Internet", cents: 6500, paid: ME, with: ["u_maya"], cat: "Home", ago: 10, group: "g_house" }),
    expense({ desc: "Groceries — Trader Joe's", cents: 8420, paid: ME, with: ["u_maya"], cat: "Groceries", ago: 6, group: "g_house" }),
    expense({ desc: "Costco run", cents: 17350, paid: "u_maya", with: [ME], cat: "Groceries", ago: 12, group: "g_house" }),
    expense({ desc: "Dish soap, paper towels", cents: 2230, paid: "u_maya", with: [ME], cat: "Home", ago: 15, group: "g_house" }),

    expense({ desc: "Books for May", cents: 4200, paid: "u_ben", with: [ME, "u_priya"], cat: "Entertainment", ago: 22, group: "g_book", tags: ["books"] }),
    expense({ desc: "Coffee — meeting", cents: 1850, paid: "u_priya", with: [ME, "u_ben"], cat: "Food", ago: 21, group: "g_book" }),

    expense({ desc: "Coffee with Sam", cents: 1240, paid: ME, with: ["u_sam"], cat: "Food", ago: 8 }),
    expense({ desc: "Movie night", cents: 3600, paid: "u_priya", with: [ME], cat: "Entertainment", ago: 14 }),
    expense({ desc: "Birthday gift for Leo", cents: 8000, paid: ME, with: ["u_sam", "u_priya"], cat: "Gifts", ago: 30 }),
  ];

  const payments: Payment[] = [
    { id: nid("p"), fromUser: ME, toUser: "u_maya", amountCents: 50000, currency: "USD", note: "Rent share", occurredAt: daysAgoISO(7), groupId: "g_house" },
    { id: nid("p"), fromUser: "u_sam", toUser: ME, amountCents: 4000, currency: "USD", note: "Got you back", occurredAt: daysAgoISO(11) },
  ];

  const comments: Comment[] = [
    { id: nid("c"), expenseId: expenses[3].id, author: ME, body: "Worth every euro 🐟", createdAt: daysAgoISO(3) },
    { id: nid("c"), expenseId: expenses[0].id, author: "u_priya", body: "Best pastry of the trip", createdAt: daysAgoISO(2) },
  ];

  return {
    meId: ME,
    users: DEMO_USERS,
    friends: [{ id: "u_sam" }, { id: "u_priya" }, { id: "u_leo" }, { id: "u_maya" }, { id: "u_ben" }],
    groups: [groupTrip, groupHouse, groupBook],
    expenses,
    payments,
    comments,
  };
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      ...seed(),
      setMe: (id) => set({ meId: id }),
      upsertUser: (u) => set((s) => ({ users: [...s.users.filter((x) => x.id !== u.id), u] })),
      addFriend: (id) => set((s) => (s.friends.find((f) => f.id === id) ? s : { friends: [...s.friends, { id }] })),
      removeFriend: (id) => set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
      addGroup: (g) => {
        const next: Group = { ...g, id: g.id ?? nid("g"), createdAt: new Date().toISOString() };
        set((s) => ({ groups: [next, ...s.groups] }));
        return next;
      },
      updateGroup: (id, patch) => set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGroup: (id) => set((s) => ({ groups: s.groups.filter((g) => g.id !== id), expenses: s.expenses.filter((e) => e.groupId !== id) })),
      addExpense: (e) => {
        const meId = get().meId;
        const next: Expense = { ...e, id: nid("e"), createdAt: new Date().toISOString(), createdBy: e.createdBy ?? meId };
        set((s) => ({ expenses: [next, ...s.expenses] }));
        return next;
      },
      updateExpense: (id, patch) =>
        set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
      addPayment: (p) => {
        const next: Payment = { ...p, id: nid("p") };
        set((s) => ({ payments: [next, ...s.payments] }));
        return next;
      },
      addComment: (c) => {
        const next: Comment = { ...c, id: nid("c"), createdAt: new Date().toISOString() };
        set((s) => ({ comments: [next, ...s.comments] }));
        return next;
      },
      resetDemo: () => set({ ...seed() }),
    }),
    { name: "wisesplit-data", version: 1 }
  )
);

export function useMe() {
  const meId = useData((s) => s.meId);
  const me = useData((s) => s.users.find((u) => u.id === meId));
  return me ?? { id: meId, name: "You" };
}

/* Unified search engine: substring | fuzzy | regex over expense + friend + group records. */

import Fuse, { type IFuseOptions } from "fuse.js";

export type SearchMode = "text" | "fuzzy" | "regex";

export type SearchableExpense = {
  id: string;
  kind: "expense";
  description: string;
  category: string;
  tags: string[];
  paidByName: string;
  groupName: string | null;
  amountCents: number;
  currency: string;
  occurredAt: string;
};

export type SearchableGroup = {
  id: string;
  kind: "group";
  name: string;
  memberNames: string[];
};

export type SearchableFriend = {
  id: string;
  kind: "friend";
  name: string;
  email: string | null;
};

export type Searchable = SearchableExpense | SearchableGroup | SearchableFriend;
export type SearchResult<T extends Searchable = Searchable> = { item: T; score?: number };

const fuseOpts: IFuseOptions<Searchable> = {
  includeScore: true,
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: "description", weight: 2 },
    { name: "category", weight: 0.6 },
    { name: "tags", weight: 0.6 },
    { name: "paidByName", weight: 0.8 },
    { name: "groupName", weight: 0.4 },
    { name: "name", weight: 2 },
    { name: "memberNames", weight: 0.6 },
    { name: "email", weight: 0.5 },
  ],
};

function textHaystack(it: Searchable): string {
  if (it.kind === "expense")
    return `${it.description} ${it.category} ${it.tags.join(" ")} ${it.paidByName} ${it.groupName ?? ""}`.toLowerCase();
  if (it.kind === "group") return `${it.name} ${it.memberNames.join(" ")}`.toLowerCase();
  return `${it.name} ${it.email ?? ""}`.toLowerCase();
}

export function search(items: Searchable[], query: string, mode: SearchMode): SearchResult[] {
  const q = query.trim();
  if (!q) return items.map((item) => ({ item }));

  if (mode === "fuzzy") {
    const fuse = new Fuse(items, fuseOpts);
    return fuse.search(q).map((r) => ({ item: r.item, score: r.score }));
  }

  if (mode === "regex") {
    let re: RegExp;
    try {
      re = new RegExp(q, "i");
    } catch {
      return [];
    }
    return items
      .filter((it) => re.test(textHaystack(it)))
      .map((item) => ({ item }));
  }

  // plain substring (tokens AND)
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  return items
    .filter((it) => {
      const hay = textHaystack(it);
      return tokens.every((t) => hay.includes(t));
    })
    .map((item) => ({ item }));
}

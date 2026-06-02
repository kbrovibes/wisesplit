import Fuse, { type IFuseOptions } from "fuse.js";

const DEFAULT_OPTS: IFuseOptions<unknown> = {
  threshold: 0.34,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export function buildFuse<T>(items: T[], keys: (keyof T | string)[], opts?: IFuseOptions<T>) {
  return new Fuse(items, { ...DEFAULT_OPTS, keys: keys as string[], ...opts });
}

export function fuzzy<T>(items: T[], query: string, keys: (keyof T | string)[]): T[] {
  if (!query.trim()) return items;
  const fuse = buildFuse(items, keys);
  return fuse.search(query).map((r) => r.item);
}

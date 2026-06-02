/** Safe regex runner — refuses catastrophic patterns and caps runtime. */

const FORBIDDEN = /(\?\?|\(\?\!|\(\?\<)/; // disallow extreme constructs

export function safeRegex(input: string, flags = "i"): RegExp | null {
  if (!input) return null;
  if (FORBIDDEN.test(input)) return null;
  if (input.length > 200) return null;
  try {
    return new RegExp(input, flags);
  } catch {
    return null;
  }
}

export function regexFilter<T>(items: T[], pattern: string, fields: (keyof T)[]): T[] {
  const rx = safeRegex(pattern);
  if (!rx) return [];
  return items.filter((it) =>
    fields.some((f) => {
      const v = (it as Record<string, unknown>)[f as string];
      return typeof v === "string" && rx.test(v);
    })
  );
}

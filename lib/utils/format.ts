import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

export function fmtMoney(cents: number, currency = "USD", locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function fmtMoneySigned(cents: number, currency = "USD"): string {
  const sign = cents > 0 ? "+" : cents < 0 ? "−" : "";
  return `${sign}${fmtMoney(Math.abs(cents), currency)}`;
}

export function fmtDate(iso: string | Date, mode: "short" | "long" | "relative" = "short"): string {
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  if (mode === "relative") {
    if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
    return formatDistanceToNow(d, { addSuffix: true });
  }
  if (mode === "long") return format(d, "EEE, MMM d, yyyy");
  return format(d, "MMM d");
}

export function parseCents(input: string): number {
  const n = Number(String(input).replace(/[^0-9.\-]/g, ""));
  if (!isFinite(n)) return 0;
  return Math.round(n * 100);
}

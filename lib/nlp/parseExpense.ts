/** Naive natural-language expense parser. Best effort, never throws. */

import { parseCents } from "@/lib/utils/format";

export type ParsedExpense = {
  description: string;
  amountCents?: number;
  currency?: string;
  withPeople: string[];
  category?: string;
  date?: Date;
};

const CATEGORY_HINTS: Record<string, string> = {
  dinner: "Food",
  lunch: "Food",
  breakfast: "Food",
  brunch: "Food",
  coffee: "Food",
  pizza: "Food",
  groceries: "Groceries",
  grocery: "Groceries",
  uber: "Transport",
  lyft: "Transport",
  taxi: "Transport",
  cab: "Transport",
  flight: "Travel",
  airbnb: "Travel",
  hotel: "Travel",
  gas: "Transport",
  rent: "Home",
  utilities: "Home",
  internet: "Home",
  movie: "Entertainment",
  concert: "Entertainment",
  gift: "Gifts",
};

export function parseExpense(input: string): ParsedExpense {
  const text = input.trim();
  const out: ParsedExpense = { description: text, withPeople: [] };
  if (!text) return out;

  // Amount: $48, 48.50, ₹2,500, 48 usd
  const amtMatch = text.match(/(?:[\$€£¥₹]\s?)?(\d{1,3}(?:[,\d]{0,12})(?:\.\d{1,2})?)(?:\s?(usd|eur|gbp|inr|jpy|cad|aud))?/i);
  if (amtMatch) {
    out.amountCents = parseCents(amtMatch[1]);
    if (amtMatch[2]) out.currency = amtMatch[2].toUpperCase();
  }
  if (/\$/.test(text)) out.currency ||= "USD";
  if (/€/.test(text)) out.currency ||= "EUR";
  if (/£/.test(text)) out.currency ||= "GBP";
  if (/₹/.test(text)) out.currency ||= "INR";
  if (/¥/.test(text)) out.currency ||= "JPY";

  // With people: "with sam", "with sam and priya"
  const withMatch = text.match(/with\s+([a-z][a-z\s,]+?)(?:\s+(?:on|yesterday|today|last|for|\$|\d|$))/i);
  if (withMatch) {
    out.withPeople = withMatch[1]
      .split(/,|\band\b/i)
      .map((n) => n.trim())
      .filter((n) => n && n.length < 30);
  }

  // Date hints
  if (/\byesterday\b/i.test(text)) {
    const d = new Date(); d.setDate(d.getDate() - 1); out.date = d;
  } else if (/\btoday\b/i.test(text)) {
    out.date = new Date();
  } else if (/\blast night\b/i.test(text)) {
    const d = new Date(); d.setDate(d.getDate() - 1); out.date = d;
  }

  // Category
  for (const [hint, cat] of Object.entries(CATEGORY_HINTS)) {
    if (new RegExp(`\\b${hint}\\b`, "i").test(text)) { out.category = cat; break; }
  }

  // Clean description: strip amount + with-clause
  let desc = text;
  if (amtMatch) desc = desc.replace(amtMatch[0], "").trim();
  if (withMatch) desc = desc.replace(withMatch[0], "").trim();
  desc = desc.replace(/\b(yesterday|today|last night|for)\b/gi, "").replace(/\s+/g, " ").trim();
  out.description = desc || (out.category ?? "Expense");

  return out;
}

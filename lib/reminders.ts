/* Reminder generation. No background sending — we open the user's mail client
   or the native share sheet so the message is sent under their identity. */

import { fmtMoney } from "@/lib/utils/format";
import type { CurrencyCode } from "@/lib/currency";

const format = (cents: number, c: CurrencyCode) => fmtMoney(cents, c);

export type ReminderInput = {
  toName: string;
  toEmail?: string | null;
  fromName: string;
  amountCents: number;
  currency: CurrencyCode;
  context?: string;
  appUrl?: string;
};

export function buildReminderSubject(r: ReminderInput) {
  return `Friendly reminder: ${format(r.amountCents, r.currency)} on wisesplit`;
}

export function buildReminderBody(r: ReminderInput) {
  const lines = [
    `Hey ${r.toName.split(" ")[0]},`,
    "",
    `Just a friendly nudge — looks like we have ${format(r.amountCents, r.currency)} outstanding between us${r.context ? ` (${r.context})` : ""}.`,
    "",
    "Whenever's convenient — no rush.",
    "",
    r.appUrl ? `Track it here: ${r.appUrl}` : "",
    `— ${r.fromName}`,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

export function mailtoFor(r: ReminderInput) {
  const subject = encodeURIComponent(buildReminderSubject(r));
  const body = encodeURIComponent(buildReminderBody(r));
  const to = r.toEmail ?? "";
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export async function shareReminder(r: ReminderInput): Promise<"shared" | "copied" | "mail"> {
  const text = `${buildReminderSubject(r)}\n\n${buildReminderBody(r)}`;
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
        title: buildReminderSubject(r),
        text,
      });
      return "shared";
    } catch {
      /* user cancelled; fall through */
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== "undefined") window.location.href = mailtoFor(r);
  return "mail";
}

export function nid(prefix = ""): string {
  const a = Math.random().toString(36).slice(2, 10);
  const b = Date.now().toString(36);
  return prefix ? `${prefix}_${a}${b}` : `${a}${b}`;
}

const PALETTE = ["#5b6cff", "#7c5bff", "#ff7a59", "#1a9a6c", "#b58105", "#0ea5e9", "#e879f9", "#f43f5e"];
export function colorFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name?: string | null): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "·";
}

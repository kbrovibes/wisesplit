import { cn } from "@/lib/utils/cn";

export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-semibold tracking-tight text-[var(--text)]", className)}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--text)" />
        <path d="M7 14a2 2 0 0 1 2-2h6a4 4 0 0 1 4 4 2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2z" fill="var(--accent)" />
        <path d="M25 18a2 2 0 0 1-2 2h-6a4 4 0 0 1-4-4 2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2z" fill="var(--bg)" />
      </svg>
      <span style={{ fontSize: Math.round(size * 0.75) }}>wisesplit</span>
    </span>
  );
}

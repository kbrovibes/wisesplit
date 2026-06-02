import { cn } from "@/lib/utils/cn";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-md text-[11px] font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-sunk)] border border-[var(--border)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}

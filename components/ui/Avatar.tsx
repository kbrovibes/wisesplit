"use client";

import { cn } from "@/lib/utils/cn";
import { colorFromString, initials } from "@/lib/utils/id";

type Props = {
  name?: string | null;
  size?: number;
  color?: string;
  className?: string;
  ring?: boolean;
};

export function Avatar({ name, size = 36, color, className, ring }: Props) {
  const bg = color ?? colorFromString(name ?? "•");
  const text = initials(name ?? "•");
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full font-medium text-white select-none shrink-0",
        ring && "ring-2 ring-[var(--bg-elev)]",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
        fontSize: Math.max(10, Math.round(size * 0.38)),
        letterSpacing: "0.02em",
      }}
      aria-label={name ?? "user"}
    >
      {text}
    </span>
  );
}

export function AvatarStack({ names, size = 28, max = 4 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((n, i) => (
        <Avatar key={i} name={n} size={size} ring />
      ))}
      {extra > 0 && (
        <span
          className="inline-grid place-items-center rounded-full bg-[var(--bg-sunk)] text-[var(--text-muted)] text-[10px] font-medium ring-2 ring-[var(--bg-elev)]"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

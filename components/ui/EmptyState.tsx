import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  illustration?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ illustration, title, description, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center text-center py-12 px-6", className)}>
      {illustration && <div className="mb-5 opacity-90">{illustration}</div>}
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

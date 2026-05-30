import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/types";

type StatusPillProps = {
  icon: IconName;
  label: string;
  value: string;
};

export function StatusPill({ icon, label, value }: StatusPillProps) {
  return (
    <div className="flex min-w-44 items-center gap-3 rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-4 py-3 shadow-sm">
      <Icon name={icon} className="h-5 w-5 text-[var(--cps-accent)]" />
      <div>
        <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}


import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/types";

type MetricCardProps = {
  label: string;
  value: string;
  icon: IconName;
};

export function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-[var(--cps-card-muted)] p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
          {label}
        </p>
        <Icon name={icon} className="h-4 w-4 text-[var(--cps-accent)]" />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

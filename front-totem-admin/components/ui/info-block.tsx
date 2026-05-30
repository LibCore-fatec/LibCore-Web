import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/types";

type InfoBlockProps = {
  label: string;
  value: string;
  icon: IconName;
};

export function InfoBlock({ label, value, icon }: InfoBlockProps) {
  return (
    <div className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold uppercase text-[var(--cps-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

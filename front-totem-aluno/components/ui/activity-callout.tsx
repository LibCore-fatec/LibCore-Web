import { Icon } from "@/components/icons";

type ActivityCalloutProps = {
  message: string;
};

export function ActivityCallout({ message }: ActivityCalloutProps) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-3 text-sm text-[var(--cps-text-muted)]">
      <Icon name="alert" className="h-4 w-4 text-[var(--cps-accent)]" />
      <span>{message}</span>
    </div>
  );
}


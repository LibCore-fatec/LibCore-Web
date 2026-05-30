import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/types";

type InfoRowProps = {
  icon: IconName;
  text: string;
};

export function InfoRow({ icon, text }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        name={icon}
        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cps-accent)]"
      />
      <span>{text}</span>
    </div>
  );
}

import { Icon } from "@/components/icons";
import { navItems } from "@/lib/mock-data";
import type { SectionId } from "@/lib/types";

type MobileNavigationProps = {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
};

export function MobileNavigation({
  activeSection,
  onSelect,
}: MobileNavigationProps) {
  return (
    <div className="border-b border-[var(--cps-border)] bg-[var(--cps-sidebar)] px-3 py-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold text-white ${
              activeSection === item.id ? "bg-white/18" : "bg-white/8"
            }`}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}


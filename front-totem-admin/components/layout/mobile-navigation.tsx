import { Icon } from "@/components/icons";
import { adminNavItems, navItems } from "@/lib/mock-data";
import type { SectionId } from "@/lib/types";

type MobileNavigationProps = {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
};

const adminIds = new Set<SectionId>(adminNavItems.map((item) => item.id));

export function MobileNavigation({
  activeSection,
  onSelect,
}: MobileNavigationProps) {
  const adminActive = adminIds.has(activeSection);

  return (
    <div className="border-b border-[var(--cps-border)] bg-[var(--cps-sidebar)] px-3 py-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {navItems
          .filter((item) => item.id !== "sair")
          .map((item) => (
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

      <div className="rounded-md border border-white/10 bg-white/6 p-2">
        <button
          className={`flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-white ${
            adminActive ? "bg-white/18" : "bg-white/8"
          }`}
          onClick={() => onSelect("admin-rfid-register")}
          type="button"
          aria-expanded={adminActive}
        >
          <Icon name="book" className="h-4 w-4 shrink-0" />
          <span className="flex-1">Admin biblioteca</span>
          <Icon name="chevronDown" className="h-4 w-4 shrink-0" />
        </button>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {adminNavItems.map((item) => (
            <button
              key={item.id}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold text-white ${
                activeSection === item.id ? "bg-white/22" : "bg-white/8"
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

      <div className="mt-2 flex gap-2 overflow-x-auto">
        {navItems
          .filter((item) => item.id === "sair")
          .map((item) => (
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

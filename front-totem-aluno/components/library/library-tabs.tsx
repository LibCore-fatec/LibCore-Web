import { Icon } from "@/components/icons";
import { ActivityCallout } from "@/components/ui/activity-callout";
import { libraryTabs } from "@/lib/mock-data";
import type { LibraryTab } from "@/lib/types";

type LibraryTabsProps = {
  activeTab: LibraryTab;
  activity: string;
  onTabChange: (tab: LibraryTab) => void;
};

export function LibraryTabs({
  activeTab,
  activity,
  onTabChange,
}: LibraryTabsProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div
        className="flex gap-1 overflow-x-auto border-b border-[var(--cps-border)]"
        role="tablist"
        aria-label="Áreas da biblioteca"
      >
        {libraryTabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex h-12 shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-4 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-[var(--cps-border)] bg-[var(--cps-card-layer)] text-[var(--cps-text)]"
                : "border-transparent text-[var(--cps-text-muted)] hover:bg-[var(--cps-card-muted)]"
            }`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
          >
            <Icon name={tab.icon} className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <ActivityCallout message={activity} />
    </div>
  );
}

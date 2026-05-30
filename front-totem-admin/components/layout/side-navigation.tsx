"use client";

import { Icon } from "@/components/icons";
import { adminNavItems, navItems } from "@/lib/mock-data";
import type { SectionId } from "@/lib/types";

type SideNavigationProps = {
  activeSection: SectionId;
  collapsed: boolean;
  onSelect: (section: SectionId) => void;
  onToggleCollapsed: () => void;
};

const adminIds = new Set<SectionId>(adminNavItems.map((item) => item.id));

export function SideNavigation({
  activeSection,
  collapsed,
  onSelect,
  onToggleCollapsed,
}: SideNavigationProps) {
  const adminActive = adminIds.has(activeSection);

  return (
    <aside
      className={`relative hidden shrink-0 flex-col bg-[var(--cps-sidebar)] text-white shadow-lg transition-all duration-300 md:flex ${
        collapsed ? "w-[76px]" : "w-[320px]"
      }`}
      aria-label="Navegação lateral"
    >
      <nav className="flex flex-1 flex-col gap-1 px-5 py-9">
        {navItems
          .filter((item) => item.id !== "sair")
          .map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                className={`group flex h-14 items-center gap-5 rounded-md px-3 text-left text-[1.32rem] transition ${
                  isActive
                    ? "bg-white/14 shadow-[inset_4px_0_0_rgba(255,255,255,0.9)]"
                    : "hover:bg-white/9"
                }`}
                onClick={() => onSelect(item.id)}
                type="button"
                aria-current={isActive ? "page" : undefined}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.beta && (
                      <span className="text-xs italic opacity-80">(beta)</span>
                    )}
                    {item.external ? (
                      <Icon name="external" className="h-4 w-4 opacity-90" />
                    ) : (
                      <Icon
                        name="chevronDown"
                        className="h-4 w-4 opacity-90"
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}

        <div className="mt-1 border-y border-white/7 py-1">
          <button
            className={`group flex h-14 w-full items-center gap-5 rounded-md px-3 text-left text-[1.32rem] transition ${
              adminActive
                ? "bg-white/14 shadow-[inset_4px_0_0_rgba(255,255,255,0.9)]"
                : "hover:bg-white/9"
            }`}
            onClick={() => onSelect("admin-rfid-register")}
            type="button"
            aria-expanded={adminActive}
          >
            <Icon name="book" className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">Admin biblioteca</span>
                <Icon name="chevronDown" className="h-4 w-4 opacity-90" />
              </>
            )}
          </button>

          {!collapsed && (
            <div className="mt-1 space-y-1 pl-5">
              {adminNavItems.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <button
                    className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-white/18 text-white"
                        : "text-white/82 hover:bg-white/9 hover:text-white"
                    }`}
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {navItems
          .filter((item) => item.id === "sair")
          .map((item) => (
            <button
              key={item.id}
              className={`group mt-2 flex h-14 items-center gap-5 rounded-md px-3 text-left text-[1.32rem] transition ${
                activeSection === item.id ? "bg-white/14" : "hover:bg-white/9"
              }`}
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </button>
          ))}
      </nav>

      {!collapsed && (
        <div className="px-8 pb-8">
          <div className="text-center text-4xl font-bold leading-none">
            Fatec
          </div>
          <div className="text-center text-sm font-semibold">Registro</div>
        </div>
      )}

      <button
        className="absolute right-[-28px] top-[352px] grid h-20 w-14 place-items-center rounded-r-full bg-[var(--cps-sidebar)] text-white shadow-md transition hover:bg-[var(--cps-sidebar-strong)]"
        onClick={onToggleCollapsed}
        type="button"
        aria-label={collapsed ? "Expandir menu" : "Contrair menu"}
      >
        <Icon
          name={collapsed ? "chevronRight" : "chevronLeft"}
          className="h-8 w-8"
        />
      </button>
    </aside>
  );
}

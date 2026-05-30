import type { ReactNode } from "react";
import { AppHero } from "@/components/layout/app-hero";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { SideNavigation } from "@/components/layout/side-navigation";
import { TopBar } from "@/components/layout/top-bar";
import type { SectionId, StudentProfile } from "@/lib/types";

type AppShellProps = {
  activeSection: SectionId;
  children: ReactNode;
  collapsed: boolean;
  isDark: boolean;
  student: StudentProfile;
  onHomeClick: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  onSelectSection: (section: SectionId) => void;
  onToggleCollapsed: () => void;
  onToggleTheme: () => void;
};

export function AppShell({
  activeSection,
  children,
  collapsed,
  isDark,
  student,
  onHomeClick,
  onNotificationsClick,
  onProfileClick,
  onSelectSection,
  onToggleCollapsed,
  onToggleTheme,
}: AppShellProps) {
  return (
    <div
      className="student-shell min-h-screen overflow-hidden"
      data-theme={isDark ? "dark" : "light"}
    >
      <TopBar
        isDark={isDark}
        student={student}
        onHomeClick={onHomeClick}
        onNotificationsClick={onNotificationsClick}
        onProfileClick={onProfileClick}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex min-h-[calc(100vh-70px)] bg-[var(--cps-base-layer)]">
        <SideNavigation
          activeSection={activeSection}
          collapsed={collapsed}
          onSelect={onSelectSection}
          onToggleCollapsed={onToggleCollapsed}
        />

        <main className="min-w-0 flex-1 overflow-auto">
          <MobileNavigation
            activeSection={activeSection}
            onSelect={onSelectSection}
          />
          <AppHero />
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AdminContent } from "@/components/admin/admin-content";
import { ConectaHome } from "@/components/conecta/conecta-home";
import { AppShell } from "@/components/layout/app-shell";
import { SectionPlaceholder } from "@/components/layout/section-placeholder";
import { adminNavItems, navItems, studentProfile } from "@/lib/mock-data";
import type { SectionId } from "@/lib/types";

export function StudentDashboard() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("academies");
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activity, setActivity] = useState(
    "Admin biblioteca pronto para operações mockadas.",
  );

  function selectSection(sectionId: SectionId) {
    setActiveSection(sectionId);
    const adminItem = adminNavItems.find((item) => item.id === sectionId);
    const label =
      [...navItems, ...adminNavItems].find((item) => item.id === sectionId)
        ?.label ?? "Conecta";

    if (adminItem) {
      setActivity(`${adminItem.label} aberto para administração da biblioteca.`);
      return;
    }

    if (sectionId === "sair") {
      setActivity("Sessão de demonstração encerrada em modo mockado.");
      return;
    }

    setActivity(`${label} aberto com conteúdo demonstrativo.`);
  }

  return (
    <AppShell
      activeSection={activeSection}
      collapsed={collapsed}
      isDark={isDark}
      student={studentProfile}
      onHomeClick={() => selectSection("academies")}
      onNotificationsClick={() =>
        setActivity("3 notificações mockadas aguardam leitura.")
      }
      onProfileClick={() =>
        setActivity(
          `Perfil mockado: ${studentProfile.name}, ${studentProfile.course}, ${studentProfile.semester}.`,
        )
      }
      onSelectSection={selectSection}
      onToggleCollapsed={() => setCollapsed((current) => !current)}
      onToggleTheme={() => setIsDark((current) => !current)}
    >
      {activeSection === "academies" ? (
        <ConectaHome />
      ) : adminNavItems.some((item) => item.id === activeSection) ? (
        <AdminContent
          activeSection={activeSection}
          activity={activity}
          onActivityChange={setActivity}
        />
      ) : (
        <SectionPlaceholder
          activeSection={activeSection}
          activity={activity}
        />
      )}
    </AppShell>
  );
}

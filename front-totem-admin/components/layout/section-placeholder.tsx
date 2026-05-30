import { InfoBlock } from "@/components/ui/info-block";
import { adminNavItems, navItems } from "@/lib/mock-data";
import type { SectionId } from "@/lib/types";

type SectionPlaceholderProps = {
  activeSection: SectionId;
  activity: string;
};

export function SectionPlaceholder({
  activeSection,
  activity,
}: SectionPlaceholderProps) {
  const label =
    [...navItems, ...adminNavItems].find((item) => item.id === activeSection)
      ?.label ?? "Conecta";

  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <div className="cps-card p-6">
        <p className="text-sm font-semibold text-[var(--cps-accent)]">
          Módulo do aluno
        </p>
        <h2 className="mt-1 text-3xl font-semibold">{label}</h2>
        <p className="mt-3 max-w-3xl text-[var(--cps-text-muted)]">
          Esta área mantém o comportamento de navegação do sistema original e
          exibe conteúdo mockado para preservar o fluxo da sidebar.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoBlock label="Status" value="Disponível" icon="check" />
          <InfoBlock label="Atualização" value="30/05/2026" icon="clock" />
          <InfoBlock label="Atividade" value={activity} icon="bell" />
        </div>
      </div>
    </section>
  );
}

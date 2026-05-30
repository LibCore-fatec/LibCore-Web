import { StatusPill } from "@/components/ui/status-pill";

export function AppHero() {
  return (
    <section className="cps-content-pattern border-b border-[var(--cps-border)] px-5 py-8 md:px-8 lg:px-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase text-[var(--cps-accent)]">
            Ãrea do aluno
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--cps-text)] md:text-5xl">
            Bem-vindo ao Conecta
          </h1>
          <p className="mt-3 max-w-3xl text-xl text-[var(--cps-text)]/85">
            Biblioteca autÃ´noma inteligente com acervo, RFID, reservas e
            histÃ³rico em tempo real.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatusPill icon="shield" label="Facial" value="Validado" />
          <StatusPill icon="rfid" label="RFID" value="Sincronizado" />
          <StatusPill icon="bell" label="Avisos" value="3 novos" />
        </div>
      </div>
    </section>
  );
}


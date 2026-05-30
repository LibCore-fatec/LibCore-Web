import { Icon } from "@/components/icons";
import { MetricCard } from "@/components/ui/metric-card";
import type { BookStatusFilter } from "@/lib/types";

type LibraryHeaderProps = {
  availableCount: number;
  loanedCount: number;
  searchTerm: string;
  setor: string;
  setores: string[];
  statusFilter: BookStatusFilter;
  tokenValidacao: string | null;
  ticketsCount: number;
  onGenerateToken: () => void;
  onSearchChange: (value: string) => void;
  onSetorChange: (setor: string) => void;
  onStatusFilterChange: (status: BookStatusFilter) => void;
};

const bookStatusFilters: { label: string; value: BookStatusFilter }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Disponível", value: "DISPONIVEL" },
  { label: "Emprestado", value: "EMPRESTADO" },
  { label: "Reservado", value: "RESERVADO" },
  { label: "Manutenção", value: "MANUTENCAO" }
];

export function LibraryHeader({
  availableCount,
  loanedCount,
  searchTerm,
  setor,
  setores,
  statusFilter,
  tokenValidacao,
  ticketsCount,
  onGenerateToken,
  onSearchChange,
  onSetorChange,
  onStatusFilterChange,
}: LibraryHeaderProps) {
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[1.2fr_0.8fr]">
      <div className="cps-card p-4 md:p-6">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold">Acervo</h2>
            <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
              Consulte livros disponÃ­veis e emprestados por nome, RFID, setor
              ou localizaÃ§Ã£o.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:w-[660px] 2xl:grid-cols-[minmax(0,1fr)_150px_150px]">
            <label className="cps-inset flex h-11 items-center gap-2 rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3 sm:col-span-2 2xl:col-span-1">
              <Icon
                name="search"
                className="h-5 w-5 text-[var(--cps-text-muted)]"
              />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--cps-text-muted)]"
                placeholder="Buscar por nome, RFID ou localizaÃ§Ã£o"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>

            <select
              className="h-11 rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-3 text-sm text-[var(--cps-text)]"
              value={setor}
              onChange={(event) => onSetorChange(event.target.value)}
              aria-label="Filtrar setor"
            >
              {setores.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className="h-11 rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-3 text-sm text-[var(--cps-text)] sm:col-span-2 2xl:col-span-1"
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(event.target.value as BookStatusFilter)
              }
              aria-label="Filtrar disponibilidade"
            >
              {bookStatusFilters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="cps-card grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
        <MetricCard
          label="DisponÃ­veis"
          value={String(availableCount)}
          icon="book"
        />
        <MetricCard
          label="Emprestados"
          value={String(loanedCount)}
          icon="clock"
        />
        <MetricCard label="Tickets" value={String(ticketsCount)} icon="ticket" />
        <button
          className="h-11 rounded-md bg-[var(--cps-accent)] px-3 text-sm font-semibold text-white sm:col-span-3 lg:col-span-1 2xl:col-span-3"
          onClick={onGenerateToken}
          type="button"
        >
          {tokenValidacao ? `Token: ${tokenValidacao}` : "Gerar token do aluno"}
        </button>
      </div>
    </div>
  );
}


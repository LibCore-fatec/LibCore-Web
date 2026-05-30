import { Icon } from "@/components/icons";
import { MetricCard } from "@/components/ui/metric-card";
import { categories } from "@/lib/mock-data";

type LibraryHeaderProps = {
  availableCount: number;
  category: string;
  reservationsCount: number;
  searchTerm: string;
  ticketsCount: number;
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
};

export function LibraryHeader({
  availableCount,
  category,
  reservationsCount,
  searchTerm,
  ticketsCount,
  onCategoryChange,
  onSearchChange,
}: LibraryHeaderProps) {
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[1.2fr_0.8fr]">
      <div className="cps-card p-4 md:p-6">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold">Biblioteca</h2>
            <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
              Consulte livros, localize prateleiras, reserve espaços e acompanhe
              suas solicitações.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px] 2xl:w-[580px]">
            <label className="cps-inset flex h-11 items-center gap-2 rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] px-3">
              <Icon
                name="search"
                className="h-5 w-5 text-[var(--cps-text-muted)]"
              />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--cps-text-muted)]"
                placeholder="Buscar por título, autor ou localização"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>

            <select
              className="h-11 rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-3 text-sm text-[var(--cps-text)]"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              aria-label="Filtrar categoria"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="cps-card grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
        <MetricCard
          label="Disponíveis"
          value={String(availableCount)}
          icon="book"
        />
        <MetricCard
          label="Reservas"
          value={String(reservationsCount)}
          icon="check"
        />
        <MetricCard label="Tickets" value={String(ticketsCount)} icon="ticket" />
      </div>
    </div>
  );
}

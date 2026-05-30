import { Icon } from "@/components/icons";
import { InfoRow } from "@/components/ui/info-row";
import type { CatalogBook } from "@/lib/types";

type BookCardProps = {
  book: CatalogBook;
  onOpenMap: (book: CatalogBook) => void;
  onSelect: (bookId: number) => void;
};

export function BookCard({ book, onOpenMap, onSelect }: BookCardProps) {
  const available = book.status === "DISPONIVEL";

  return (
    <article className="cps-card flex min-h-56 flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-[var(--cps-border-strong)] md:p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-sm bg-[var(--cps-card-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--cps-text-muted)]">
            Setor {book.localizacao?.setor ?? "-"}
          </span>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {book.statusLabel}
          </span>
        </div>

        <button
          className="block w-full text-left"
          onClick={() => onSelect(book.id_livro)}
          type="button"
        >
          <h3 className="text-xl font-semibold leading-tight text-[var(--cps-text)]">
            {book.nome_livro}
          </h3>
          <p className="mt-2 text-sm font-medium text-[var(--cps-text-muted)]">
            RFID {book.rfid_livro}
          </p>
        </button>

        <div className="grid gap-2 text-sm text-[var(--cps-text-muted)]">
          <InfoRow icon="map" text={book.locationLabel} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--cps-border)] pt-4">
        <InfoRow icon="rfid" text={book.rfid_livro} />
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[var(--cps-border)] transition hover:bg-[var(--cps-card-muted)]"
          onClick={() => onOpenMap(book)}
          type="button"
          aria-label={`Ver localização de ${book.nome_livro}`}
        >
          <Icon name="map" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

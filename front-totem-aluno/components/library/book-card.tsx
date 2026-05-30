import { Icon } from "@/components/icons";
import { InfoRow } from "@/components/ui/info-row";
import type { Book } from "@/lib/types";

type BookCardProps = {
  book: Book;
  onOpenMap: (book: Book) => void;
  onSelect: (bookId: string) => void;
};

export function BookCard({ book, onOpenMap, onSelect }: BookCardProps) {
  const available = book.status === "Disponível";

  return (
    <article className="cps-card flex min-h-56 flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-[var(--cps-border-strong)] md:p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-sm bg-[var(--cps-card-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--cps-text-muted)]">
            {book.category}
          </span>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {available ? "Disponível" : "Emprestado"}
          </span>
        </div>

        <button
          className="block w-full text-left"
          onClick={() => onSelect(book.id)}
          type="button"
        >
          <h3 className="text-xl font-semibold leading-tight text-[var(--cps-text)]">
            {book.title}
          </h3>
          <p className="mt-2 text-sm font-medium text-[var(--cps-text-muted)]">
            {book.author}
          </p>
        </button>

        <div className="grid gap-2 text-sm text-[var(--cps-text-muted)]">
          <InfoRow icon="map" text={book.location} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--cps-border)] pt-4">
        <InfoRow icon="rfid" text={book.rfid} />
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[var(--cps-border)] transition hover:bg-[var(--cps-card-muted)]"
          onClick={() => onOpenMap(book)}
          type="button"
          aria-label={`Ver localização de ${book.title}`}
        >
          <Icon name="map" className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

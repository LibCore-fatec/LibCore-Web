import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import { InfoRow } from "@/components/ui/info-row";
import type { Book } from "@/lib/types";

type BookCardProps = {
  book: Book;
  reserved: boolean;
  onOpenMap: (book: Book) => void;
  onReserve: (book: Book) => void;
  onSelect: (bookId: string) => void;
};

export function BookCard({
  book,
  reserved,
  onOpenMap,
  onReserve,
  onSelect,
}: BookCardProps) {
  const unavailable = book.status !== "Disponível" || reserved;
  const status = reserved ? "Reservado por você" : book.status;

  return (
    <article className="cps-card overflow-hidden">
      <button
        className="book-cover flex h-44 w-full flex-col justify-between p-5 text-left text-white"
        onClick={() => onSelect(book.id)}
        style={
          {
            "--cover-from": book.coverFrom,
            "--cover-to": book.coverTo,
          } as CSSProperties
        }
        type="button"
      >
        <div className="relative z-10 flex items-center justify-between">
          <span className="rounded-full bg-black/22 px-3 py-1 text-xs font-semibold">
            {book.category}
          </span>
          <Icon name="rfid" className="h-5 w-5" />
        </div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.08em] opacity-80">
            Biblioteca Fatec
          </p>
          <h3 className="mt-1 max-w-[18rem] text-2xl font-semibold leading-tight">
            {book.title}
          </h3>
        </div>
      </button>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm text-[var(--cps-text-muted)]">{book.author}</p>
          <p className="mt-2 line-clamp-2 text-sm">{book.summary}</p>
        </div>

        <div className="grid gap-2 text-sm text-[var(--cps-text-muted)]">
          <InfoRow icon="map" text={book.location} />
          <InfoRow icon="rfid" text={`${book.rfid} · ISBN ${book.isbn}`} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cps-border)] pt-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              unavailable
                ? "bg-[var(--cps-card-muted)] text-[var(--cps-text-muted)]"
                : "bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]"
            }`}
          >
            {status}
          </span>

          <div className="flex gap-2">
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cps-border)] transition hover:bg-[var(--cps-card-muted)]"
              onClick={() => onOpenMap(book)}
              type="button"
              aria-label={`Ver localização de ${book.title}`}
            >
              <Icon name="map" className="h-4 w-4" />
            </button>
            <button
              className={`h-9 rounded-md px-4 text-sm font-semibold transition ${
                unavailable
                  ? "bg-[var(--cps-card-muted)] text-[var(--cps-text-muted)]"
                  : "bg-[var(--cps-accent)] text-white hover:opacity-90"
              }`}
              onClick={() => onReserve(book)}
              type="button"
              disabled={unavailable}
            >
              {reserved ? "Reservado" : "Reservar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

import { Icon } from "@/components/icons";
import { BookCard } from "@/components/library/book-card";
import type { Book } from "@/lib/types";

type BooksPanelProps = {
  filteredBooks: Book[];
  onOpenMap: (book: Book) => void;
  onSelectBook: (bookId: string) => void;
};

export function BooksPanel({
  filteredBooks,
  onOpenMap,
  onSelectBook,
}: BooksPanelProps) {
  if (filteredBooks.length === 0) {
    return (
      <div className="cps-card grid min-h-64 place-items-center p-8 text-center">
        <div>
          <Icon
            name="bookSearch"
            className="mx-auto mb-3 h-10 w-10 text-[var(--cps-text-muted)]"
          />
          <h3 className="text-xl font-semibold">Nenhum livro encontrado</h3>
          <p className="mt-2 text-sm text-[var(--cps-text-muted)]">
            Ajuste a busca ou o filtro de categoria para consultar o acervo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {filteredBooks.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onOpenMap={onOpenMap}
          onSelect={onSelectBook}
        />
      ))}
    </div>
  );
}

import { BooksPanel } from "@/components/library/books-panel";
import { HistoryPanel } from "@/components/library/history-panel";
import { LibraryHeader } from "@/components/library/library-header";
import { LibraryTabs } from "@/components/library/library-tabs";
import { MapPanel } from "@/components/library/map-panel";
import { SpacesPanel } from "@/components/library/spaces-panel";
import { TicketsPanel } from "@/components/library/tickets-panel";
import type { Book, LibraryTab, Ticket } from "@/lib/types";

type LibraryContentProps = {
  activeTab: LibraryTab;
  activity: string;
  availableCount: number;
  category: string;
  filteredBooks: Book[];
  renewedLoanIds: string[];
  reservedBookIds: string[];
  reservedSpaceIds: string[];
  searchTerm: string;
  selectedBook: Book;
  ticketDescription: string;
  tickets: Ticket[];
  isReserved: (bookId: string) => boolean;
  onCategoryChange: (category: string) => void;
  onCreateTicket: () => void;
  onOpenMap: (book: Book) => void;
  onReserveBook: (book: Book) => void;
  onReserveSpace: (spaceId: string, spaceName: string) => void;
  onRenewLoan: (loanId: string, title: string) => void;
  onSearchChange: (value: string) => void;
  onSelectBook: (bookId: string) => void;
  onTabChange: (tab: LibraryTab) => void;
  onTicketDescriptionChange: (value: string) => void;
};

export function LibraryContent({
  activeTab,
  activity,
  availableCount,
  category,
  filteredBooks,
  renewedLoanIds,
  reservedBookIds,
  reservedSpaceIds,
  searchTerm,
  selectedBook,
  ticketDescription,
  tickets,
  isReserved,
  onCategoryChange,
  onCreateTicket,
  onOpenMap,
  onReserveBook,
  onReserveSpace,
  onRenewLoan,
  onSearchChange,
  onSelectBook,
  onTabChange,
  onTicketDescriptionChange,
}: LibraryContentProps) {
  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <LibraryHeader
        availableCount={availableCount}
        category={category}
        reservationsCount={reservedBookIds.length + reservedSpaceIds.length}
        searchTerm={searchTerm}
        ticketsCount={tickets.length}
        onCategoryChange={onCategoryChange}
        onSearchChange={onSearchChange}
      />

      <LibraryTabs
        activeTab={activeTab}
        activity={activity}
        onTabChange={onTabChange}
      />

      {activeTab === "acervo" && (
        <BooksPanel
          filteredBooks={filteredBooks}
          isReserved={isReserved}
          onOpenMap={onOpenMap}
          onReserveBook={onReserveBook}
          onSelectBook={onSelectBook}
        />
      )}
      {activeTab === "historico" && (
        <HistoryPanel
          renewedLoanIds={renewedLoanIds}
          onRenewLoan={onRenewLoan}
        />
      )}
      {activeTab === "espacos" && (
        <SpacesPanel
          reservedSpaceIds={reservedSpaceIds}
          onReserveSpace={onReserveSpace}
        />
      )}
      {activeTab === "mapa" && <MapPanel selectedBook={selectedBook} />}
      {activeTab === "tickets" && (
        <TicketsPanel
          ticketDescription={ticketDescription}
          tickets={tickets}
          onCreateTicket={onCreateTicket}
          onTicketDescriptionChange={onTicketDescriptionChange}
        />
      )}
    </section>
  );
}

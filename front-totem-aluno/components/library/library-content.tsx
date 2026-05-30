import { BooksPanel } from "@/components/library/books-panel";
import { HistoryPanel } from "@/components/library/history-panel";
import { LibraryHeader } from "@/components/library/library-header";
import { LibraryTabs } from "@/components/library/library-tabs";
import { MapPanel } from "@/components/library/map-panel";
import { SpacesPanel } from "@/components/library/spaces-panel";
import { TicketsPanel } from "@/components/library/tickets-panel";
import type { Book, BookStatusFilter, LibraryTab, Ticket } from "@/lib/types";

type LibraryContentProps = {
  activeTab: LibraryTab;
  activity: string;
  availableCount: number;
  category: string;
  filteredBooks: Book[];
  loanedCount: number;
  renewedLoanIds: string[];
  reservedSpaceIds: string[];
  searchTerm: string;
  selectedBook: Book;
  statusFilter: BookStatusFilter;
  ticketDescription: string;
  tickets: Ticket[];
  onCategoryChange: (category: string) => void;
  onCreateTicket: () => void;
  onOpenMap: (book: Book) => void;
  onReserveSpace: (spaceId: string, spaceName: string) => void;
  onRenewLoan: (loanId: string, title: string) => void;
  onSearchChange: (value: string) => void;
  onSelectBook: (bookId: string) => void;
  onStatusFilterChange: (status: BookStatusFilter) => void;
  onTabChange: (tab: LibraryTab) => void;
  onTicketDescriptionChange: (value: string) => void;
};

export function LibraryContent({
  activeTab,
  activity,
  availableCount,
  category,
  filteredBooks,
  loanedCount,
  renewedLoanIds,
  reservedSpaceIds,
  searchTerm,
  selectedBook,
  statusFilter,
  ticketDescription,
  tickets,
  onCategoryChange,
  onCreateTicket,
  onOpenMap,
  onReserveSpace,
  onRenewLoan,
  onSearchChange,
  onSelectBook,
  onStatusFilterChange,
  onTabChange,
  onTicketDescriptionChange,
}: LibraryContentProps) {
  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <LibraryHeader
        availableCount={availableCount}
        category={category}
        loanedCount={loanedCount}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        ticketsCount={tickets.length}
        onCategoryChange={onCategoryChange}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
      />

      <LibraryTabs
        activeTab={activeTab}
        activity={activity}
        onTabChange={onTabChange}
      />

      {activeTab === "acervo" && (
        <BooksPanel
          filteredBooks={filteredBooks}
          onOpenMap={onOpenMap}
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

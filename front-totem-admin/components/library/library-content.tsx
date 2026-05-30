import { BooksPanel } from "@/components/library/books-panel";
import { HistoryPanel } from "@/components/library/history-panel";
import { LibraryHeader } from "@/components/library/library-header";
import { LibraryTabs } from "@/components/library/library-tabs";
import { MapPanel } from "@/components/library/map-panel";
import { SpacesPanel } from "@/components/library/spaces-panel";
import { TicketsPanel } from "@/components/library/tickets-panel";
import type {
  BookStatusFilter,
  CatalogBook,
  LibraryTab,
  Ticket,
} from "@/lib/types";

type LibraryContentProps = {
  activeTab: LibraryTab;
  activity: string;
  availableCount: number;
  filteredBooks: CatalogBook[];
  loanedCount: number;
  renewedLoanIds: number[];
  reservedSpaceIds: string[];
  searchTerm: string;
  selectedBook: CatalogBook;
  setor: string;
  statusFilter: BookStatusFilter;
  ticketDescription: string;
  tickets: Ticket[];
  onCreateTicket: () => void;
  onOpenMap: (book: CatalogBook) => void;
  onReserveSpace: (spaceId: string, spaceName: string) => void;
  onRenewLoan: (loanId: number, title: string) => void;
  onSearchChange: (value: string) => void;
  onSelectBook: (bookId: number) => void;
  onSetorChange: (setor: string) => void;
  onStatusFilterChange: (status: BookStatusFilter) => void;
  onTabChange: (tab: LibraryTab) => void;
  onTicketDescriptionChange: (value: string) => void;
};

export function LibraryContent({
  activeTab,
  activity,
  availableCount,
  filteredBooks,
  loanedCount,
  renewedLoanIds,
  reservedSpaceIds,
  searchTerm,
  selectedBook,
  setor,
  statusFilter,
  ticketDescription,
  tickets,
  onCreateTicket,
  onOpenMap,
  onReserveSpace,
  onRenewLoan,
  onSearchChange,
  onSelectBook,
  onSetorChange,
  onStatusFilterChange,
  onTabChange,
  onTicketDescriptionChange,
}: LibraryContentProps) {
  return (
    <section className="px-5 py-6 md:px-8 lg:px-10">
      <LibraryHeader
        availableCount={availableCount}
        loanedCount={loanedCount}
        searchTerm={searchTerm}
        setor={setor}
        statusFilter={statusFilter}
        ticketsCount={tickets.length}
        onSearchChange={onSearchChange}
        onSetorChange={onSetorChange}
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

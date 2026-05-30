import { formatTicketStatus } from "@/lib/mock-data";
import type { Ticket } from "@/lib/types";

type TicketsPanelProps = {
  ticketDescription: string;
  tickets: Ticket[];
  onCreateTicket: () => void;
  onTicketDescriptionChange: (value: string) => void;
};

export function TicketsPanel({
  ticketDescription,
  tickets,
  onCreateTicket,
  onTicketDescriptionChange,
}: TicketsPanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <div className="cps-card p-5">
        <h3 className="text-xl font-semibold">Registrar ticket</h3>
        <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
          Informe problemas com livros, RFID, localizaÃ§Ã£o ou espaÃ§os de estudo.
        </p>
        <textarea
          className="mt-5 min-h-36 w-full resize-none rounded-sm border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-3 text-sm outline-none"
          placeholder="Descreva a solicitaÃ§Ã£o"
          value={ticketDescription}
          onChange={(event) => onTicketDescriptionChange(event.target.value)}
        />
        <button
          className="mt-4 h-10 w-full rounded-md bg-[var(--cps-accent)] text-sm font-semibold text-white"
          onClick={onCreateTicket}
          type="button"
        >
          Criar ticket
        </button>
      </div>

      <div className="cps-card p-5">
        <h3 className="text-xl font-semibold">Acompanhamento</h3>
        <div className="mt-5 space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id_ticket}
              className="rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {ticket.descricao ?? ticket.tipo}
                  </p>
                  <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
                    {ticket.tipo} Â·{" "}
                    {new Date(ticket.data_criacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-[var(--cps-accent)]">
                  {formatTicketStatus(ticket.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


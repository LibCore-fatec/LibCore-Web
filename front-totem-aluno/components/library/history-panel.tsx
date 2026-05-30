import { InfoBlock } from "@/components/ui/info-block";
import type { LoanRecord } from "@/lib/types";

type HistoryPanelProps = {
  loanRecords: LoanRecord[];
  renewedLoanIds: number[];
  onRenewLoan: (loanId: number, title: string) => void;
};

export function HistoryPanel({
  loanRecords,
  renewedLoanIds,
  onRenewLoan,
}: HistoryPanelProps) {
  const emprestimosAtivos = loanRecords.filter((loan) => loan.tipo === "EMPRESTIMO").length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="cps-card p-5">
        <h3 className="text-xl font-semibold">Histórico do aluno</h3>
        <div className="mt-5 space-y-3">
          {loanRecords.map((loan) => {
            const renewed = renewedLoanIds.includes(loan.id_transacao);
            return (
              <div
                key={loan.id_transacao}
                className="grid gap-4 rounded-lg border border-[var(--cps-border)] bg-[var(--cps-card-muted)] p-4 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold">{loan.livro_nome}</p>
                  <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
                    {loan.dateLabel}
                  </p>
                  <p className="text-sm text-[var(--cps-text-muted)]">
                    {renewed ? "Nova devolução solicitada" : loan.dueLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-[var(--cps-accent)]">
                    {renewed ? "Renovado" : loan.statusLabel}
                  </span>
                  {loan.tipo === "EMPRESTIMO" && (
                    <button
                      className="h-9 rounded-md bg-[var(--cps-accent)] px-4 text-sm font-semibold text-white"
                      onClick={() =>
                        onRenewLoan(loan.id_transacao, loan.livro_nome)
                      }
                      type="button"
                    >
                      Renovar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cps-card p-5">
        <h3 className="text-xl font-semibold">Resumo</h3>
        <div className="mt-5 space-y-4">
          <InfoBlock label="Empréstimos ativos" value={`${emprestimosAtivos} livro(s)`} icon="book" />
          <InfoBlock label="Multas pendentes" value="R$ 0,00" icon="check" />
          <InfoBlock
            label="Próxima devolução"
            value={loanRecords[0]?.dueLabel ?? "Sem empréstimos ativos"}
            icon="clock"
          />
        </div>
      </div>
    </div>
  );
}

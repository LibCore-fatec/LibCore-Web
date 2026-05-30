import { Icon } from "@/components/icons";
import { InfoBlock } from "@/components/ui/info-block";
import type { CatalogBook } from "@/lib/types";

const corridors = ["A", "B", "C", "D", "E", "F", "G", "H"];

type MapPanelProps = {
  selectedBook: CatalogBook;
};

export function MapPanel({ selectedBook }: MapPanelProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="cps-card overflow-hidden">
        <div className="border-b border-[var(--cps-border)] p-5">
          <h3 className="text-xl font-semibold">Mapa digital do acervo</h3>
          <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
            Localização atual baseada na etiqueta {selectedBook.rfid_livro}.
          </p>
        </div>
        <div className="grid min-h-[430px] gap-4 p-5 md:grid-cols-4">
          {corridors.map((corridor) => {
            const active = selectedBook.localizacao?.setor === corridor;
            return (
              <div
                key={corridor}
                className={`flex min-h-32 flex-col justify-between rounded-lg border p-4 ${
                  active
                    ? "border-[var(--cps-accent)] bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]"
                    : "border-[var(--cps-border)] bg-[var(--cps-card-muted)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Corredor {corridor}
                  </span>
                  {active && <Icon name="check" className="h-5 w-5" />}
                </div>
                <div className="grid gap-2">
                  <span className="h-3 rounded-full bg-current opacity-20" />
                  <span className="h-3 rounded-full bg-current opacity-20" />
                  <span className="h-3 rounded-full bg-current opacity-20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="cps-card p-5">
        <p className="text-sm font-semibold text-[var(--cps-accent)]">
          Livro selecionado
        </p>
        <h3 className="mt-1 text-2xl font-semibold">
          {selectedBook.nome_livro}
        </h3>
        <p className="mt-2 text-sm text-[var(--cps-text-muted)]">
          ID do livro: {selectedBook.id_livro}
        </p>
        <div className="mt-5 space-y-4">
          <InfoBlock
            label="Localização"
            value={selectedBook.locationLabel}
            icon="map"
          />
          <InfoBlock
            label="Etiqueta RFID"
            value={selectedBook.rfid_livro}
            icon="rfid"
          />
          <InfoBlock label="Status" value={selectedBook.statusLabel} icon="check" />
        </div>
      </aside>
    </div>
  );
}

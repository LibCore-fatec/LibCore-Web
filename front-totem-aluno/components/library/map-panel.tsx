import { Icon } from "@/components/icons";
import { InfoBlock } from "@/components/ui/info-block";
import type { CatalogBook } from "@/lib/types";

const sectors = [
  { id: "A", label: "Tecnologia", grid: "col-start-1 row-start-2", shelves: ["A1", "A2", "A3", "A4"] },
  { id: "B", label: "Banco de dados", grid: "col-start-2 row-start-2", shelves: ["B1", "B2", "B3", "B4"] },
  { id: "C", label: "IA e pesquisa", grid: "col-start-3 row-start-2", shelves: ["C1", "C2", "C3", "C4"] },
  { id: "D", label: "Leitura", grid: "col-start-4 row-start-2", shelves: ["D1", "D2", "D3", "D4"] },
];

const demoPoints = [
  { top: "18%", left: "15%", label: "Entrada" },
  { top: "18%", left: "45%", label: "Balcão" },
  { top: "18%", left: "78%", label: "Sala estudo" },
];

type MapPanelProps = {
  selectedBook: CatalogBook;
};

function getSector(book: CatalogBook) {
  return book.localizacao?.setor ?? "A";
}

export function MapPanel({ selectedBook }: MapPanelProps) {
  const activeSector = getSector(selectedBook);
  const shelf = selectedBook.localizacao?.estante ?? "01";
  const divider = selectedBook.localizacao?.divisoria ?? "01";

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="cps-card overflow-hidden">
        <div className="border-b border-[var(--cps-border)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cps-accent)]">
            Visual CPS · mapa 2D
          </p>
          <h3 className="mt-1 text-2xl font-bold text-[var(--cps-text)]">
            Mapa digital da biblioteca
          </h3>
          <p className="mt-1 text-sm text-[var(--cps-text-muted)]">
            Planta mockada para apresentação, preparada para futura integração 3D/Blender.
          </p>
        </div>

        <div className="relative min-h-[520px] bg-[linear-gradient(135deg,rgba(176,0,32,0.08)_0%,rgba(255,255,255,1)_46%,rgba(32,44,57,0.08)_100%)] p-5">
          <div className="absolute inset-5 rounded-[2rem] border-4 border-[var(--cps-border-strong)] bg-white/75 shadow-inner" />

          <div className="relative grid min-h-[470px] grid-cols-4 grid-rows-[92px_1fr_92px] gap-4">
            <div className="col-span-4 grid grid-cols-3 gap-4">
              {demoPoints.map((point) => (
                <div key={point.label} className="rounded-2xl border border-[var(--cps-border)] bg-white/95 p-4 text-center shadow-sm">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]">
                    <Icon name={point.label === "Entrada" ? "home" : point.label === "Balcão" ? "user" : "room"} className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase text-[var(--cps-text-muted)]">{point.label}</p>
                </div>
              ))}
            </div>

            {sectors.map((sector) => {
              const active = activeSector === sector.id;
              return (
                <div
                  key={sector.id}
                  className={`relative flex min-h-[260px] flex-col justify-between rounded-3xl border p-4 shadow-sm transition ${
                    active
                      ? "border-[var(--cps-accent)] bg-[var(--cps-accent-soft)] text-[var(--cps-accent)] ring-4 ring-[rgba(176,0,32,0.12)]"
                      : "border-[var(--cps-border)] bg-white/95 text-[var(--cps-text)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-75">Setor {sector.id}</p>
                      <h4 className="mt-1 text-lg font-bold">{sector.label}</h4>
                    </div>
                    {active && (
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
                        <Icon name="rfid" className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {sector.shelves.map((item, index) => {
                      const selectedShelf = active && item.endsWith(shelf.padStart(2, "0").slice(-1));
                      return (
                        <div key={item} className="flex items-center gap-2">
                          <span className={`h-4 flex-1 rounded-full ${selectedShelf ? "bg-[var(--cps-accent)]" : "bg-current opacity-20"}`} />
                          <span className="w-8 text-right text-xs font-bold">{item}</span>
                          {active && index === 1 && (
                            <span className="animate-pulse rounded-full bg-[var(--cps-accent)] px-2 py-1 text-[10px] font-bold text-white">RFID</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="col-span-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-3xl border border-dashed border-[var(--cps-border-strong)] bg-white/80 p-4">
              <div className="h-2 rounded-full bg-[var(--cps-accent-soft)]" />
              <div className="rounded-full bg-[var(--cps-accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
                Rota sugerida: Entrada → Setor {activeSector} → Estante {shelf}
              </div>
              <div className="h-2 rounded-full bg-[var(--cps-accent-soft)]" />
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="cps-card p-5">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--cps-accent)]">
            Livro localizado
          </p>
          <h3 className="mt-2 text-2xl font-bold text-[var(--cps-text)]">
            {selectedBook.nome_livro}
          </h3>
          <p className="mt-2 text-sm text-[var(--cps-text-muted)]">
            Siga a rota destacada no mapa até o setor indicado.
          </p>
          <div className="mt-5 space-y-4">
            <InfoBlock label="Localização" value={selectedBook.locationLabel} icon="map" />
            <InfoBlock label="Etiqueta RFID" value={selectedBook.rfid_livro} icon="rfid" />
            <InfoBlock label="Status" value={selectedBook.statusLabel} icon="check" />
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--cps-border)] bg-white p-5 shadow-sm">
          <h4 className="font-bold text-[var(--cps-text)]">Detalhe da busca</h4>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between rounded-2xl bg-[var(--cps-card-muted)] p-3">
              <span className="text-[var(--cps-text-muted)]">Setor</span>
              <strong>{activeSector}</strong>
            </div>
            <div className="flex justify-between rounded-2xl bg-[var(--cps-card-muted)] p-3">
              <span className="text-[var(--cps-text-muted)]">Estante</span>
              <strong>{shelf}</strong>
            </div>
            <div className="flex justify-between rounded-2xl bg-[var(--cps-card-muted)] p-3">
              <span className="text-[var(--cps-text-muted)]">Divisória</span>
              <strong>{divider}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

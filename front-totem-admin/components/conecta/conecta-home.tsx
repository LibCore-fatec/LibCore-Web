import { Icon } from "@/components/icons";
import { conectaCards } from "@/lib/mock-data";

export function ConectaHome() {
  return (
    <section className="px-5 py-7 md:px-8 lg:px-10">
      <div className="mb-8 inline-flex h-14 items-center gap-3 rounded-t-md border border-b-0 border-[var(--cps-border)] bg-[var(--cps-card-layer)] px-5 text-xl text-neutral-950 shadow-sm">
        <Icon name="globe" className="h-6 w-6" />
        Para toda comunidade
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {conectaCards.map((card) => (
          <article
            className="cps-card min-w-0 overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
            key={card.id}
          >
            <div className="conecta-poster relative min-h-[400px] bg-neutral-950 p-6 text-white">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold leading-none">Fatec</p>
                  <p className="text-[0.64rem] font-semibold uppercase">
                    Registro
                  </p>
                </div>
                <span className="rounded-full bg-slate-500 px-5 py-3 text-sm font-bold">
                  {card.tag}
                </span>
              </div>

              <div className="relative z-10 mt-16">
                <p className="text-xs uppercase tracking-wide">Workshop</p>
                <h3 className="mt-2 text-xl font-black uppercase leading-tight text-[#f4cf00]">
                  {card.title.replace("Workshop FTX - ", "")}
                </h3>
              </div>

              <div className="relative z-10 mt-10 text-xs uppercase text-white/75">
                <p>Ministrado por:</p>
                <p className="mt-2 font-bold text-white">{card.author}</p>
              </div>

              <div className="relative z-10 mt-10 border-y border-[#d2be00] py-4">
                <p className="text-xs uppercase text-white/70">No dia</p>
                <p className="mt-1 text-lg font-black uppercase">
                  {card.date.split(" das ")[0]}
                </p>
              </div>
              <p className="relative z-10 mt-5 text-center text-2xl font-black text-white/75">
                FTX<span className="text-[#f4cf00]">&apos;26</span>
              </p>
            </div>

            <div className="p-7">
              <h2 className="line-clamp-2 min-h-[4rem] text-2xl font-bold leading-tight text-[var(--cps-text)]">
                {card.title}
              </h2>
              <div className="mt-5 flex items-start gap-3 rounded-md bg-[var(--cps-card-muted)] p-3 text-lg text-[var(--cps-text)]">
                <Icon
                  name="clock"
                  className="mt-1 h-6 w-6 shrink-0 text-[var(--cps-accent)]"
                />
                <span>{card.date}</span>
              </div>
              <p className="mt-4 text-sm text-[var(--cps-text-muted)]">
                Desenvolvido por FATEC Registro
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

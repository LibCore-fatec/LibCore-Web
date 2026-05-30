"use client";

import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  DoorOpen,
  GraduationCap,
  History,
  Home,
  Library,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  QrCode,
  Search,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  Wifi,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  status: "Disponível" | "Emprestado" | "Reservado";
  location: string;
  shelf: string;
  due?: string;
  rating: number;
};

type Reservation = {
  id: number;
  space: string;
  date: string;
  time: string;
  capacity: string;
  status: "Confirmada" | "Disponível";
};

type Notification = {
  id: number;
  title: string;
  description: string;
  type: "Aviso" | "Reserva" | "Devolução";
};

const books: Book[] = [
  {
    id: 1,
    title: "Engenharia de Software Moderna",
    author: "Marco Tulio Valente",
    category: "Tecnologia",
    status: "Disponível",
    location: "Corredor A",
    shelf: "Estante 02 · Prateleira 04",
    rating: 4.9
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Programação",
    status: "Reservado",
    location: "Corredor B",
    shelf: "Estante 05 · Prateleira 01",
    due: "Retirada até 31/05",
    rating: 4.8
  },
  {
    id: 3,
    title: "Banco de Dados: Projeto e Implementação",
    author: "Carlos Heuser",
    category: "Dados",
    status: "Disponível",
    location: "Corredor C",
    shelf: "Estante 01 · Prateleira 03",
    rating: 4.6
  },
  {
    id: 4,
    title: "Design de Interfaces",
    author: "Jenifer Tidwell",
    category: "UX/UI",
    status: "Emprestado",
    location: "Corredor D",
    shelf: "Estante 08 · Prateleira 02",
    due: "Devolve em 04/06",
    rating: 4.7
  },
  {
    id: 5,
    title: "Redes de Computadores",
    author: "Andrew S. Tanenbaum",
    category: "Infraestrutura",
    status: "Disponível",
    location: "Corredor A",
    shelf: "Estante 03 · Prateleira 05",
    rating: 4.5
  }
];

const reservations: Reservation[] = [
  { id: 1, space: "Sala de estudo 01", date: "Hoje", time: "14:00 - 16:00", capacity: "4 pessoas", status: "Confirmada" },
  { id: 2, space: "Mesa individual 07", date: "Amanhã", time: "09:00 - 11:00", capacity: "1 pessoa", status: "Disponível" },
  { id: 3, space: "Área de leitura", date: "Sexta", time: "18:00 - 19:00", capacity: "Livre", status: "Disponível" }
];

const notifications: Notification[] = [
  { id: 1, title: "Devolução próxima", description: "Clean Code deve ser retirado até 31/05.", type: "Devolução" },
  { id: 2, title: "Reserva confirmada", description: "Sala de estudo 01 reservada para hoje às 14h.", type: "Reserva" },
  { id: 3, title: "Totem atualizado", description: "Autoatendimento por RFID disponível na entrada da biblioteca.", type: "Aviso" }
];

const menuItems = [
  { label: "Academies", icon: GraduationCap, suffix: "↗" },
  { label: "Eventos", icon: CalendarDays, hasChevron: true },
  { label: "Extensão", icon: Sparkles, hasChevron: true },
  { label: "Projetos", icon: MessageSquare, tag: "beta", hasChevron: true },
  { label: "QTE", icon: GraduationCap, tag: "beta", hasChevron: true },
  { label: "Práticas", icon: Ticket, tag: "beta", hasChevron: true },
  { label: "Biblioteca", icon: Library, active: true },
  { label: "Sair", icon: LogOut }
];

function statusClass(status: Book["status"] | Reservation["status"]) {
  if (status === "Disponível") return "bg-emerald-50 text-cps-success ring-emerald-200";
  if (status === "Confirmada") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (status === "Reservado") return "bg-amber-50 text-cps-warning ring-amber-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[280px] transform bg-cps-sidebar text-white shadow-soft transition-transform lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 bg-cps-red px-6">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-wide">
          <span className="text-3xl leading-none">‹</span>
          Conecta
        </div>
        <button className="lg:hidden" onClick={onClose} aria-label="Fechar menu">
          <X size={24} />
        </button>
      </div>

      <nav className="mt-7 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-lg transition ${
                item.active ? "bg-white text-cps-sidebar shadow-card" : "text-white/95 hover:bg-white/10"
              }`}
            >
              <Icon size={22} />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.tag && <span className="text-xs italic opacity-80">{item.tag}</span>}
              {item.suffix && <span className="text-base">{item.suffix}</span>}
              {item.hasChevron && <ChevronDown size={18} />}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-7 left-7">
        <div className="text-4xl font-semibold tracking-wide">Fatec</div>
        <div className="ml-20 -mt-1 text-sm font-bold">Registro</div>
      </div>
    </aside>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof BookOpen; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-cps-line/70">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-cps-cyan p-3 text-cps-sidebar">
          <Icon size={23} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-cps-muted">Hoje</span>
      </div>
      <p className="text-sm text-cps-muted">{label}</p>
      <h3 className="mt-1 text-3xl font-bold text-cps-ink">{value}</h3>
      <p className="mt-2 text-sm text-cps-muted">{hint}</p>
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <article className="card-focus rounded-2xl bg-white p-5 shadow-card ring-1 ring-cps-line/70 transition hover:-translate-y-1 hover:shadow-soft" tabIndex={0}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-xl bg-cps-sidebar p-3 text-white">
          <BookOpen size={24} />
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(book.status)}`}>{book.status}</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cps-red">{book.category}</p>
      <h3 className="mt-2 line-clamp-2 min-h-[56px] text-xl font-bold leading-7 text-cps-ink">{book.title}</h3>
      <p className="mt-1 text-sm text-cps-muted">{book.author}</p>

      <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex items-center gap-2 text-cps-ink">
          <MapPin size={17} className="text-cps-red" />
          {book.location}
        </div>
        <div className="flex items-center gap-2 text-cps-muted">
          <QrCode size={17} />
          {book.shelf}
        </div>
        {book.due && (
          <div className="flex items-center gap-2 text-cps-muted">
            <Clock3 size={17} />
            {book.due}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm font-semibold text-cps-warning">
          <Star size={17} fill="currentColor" />
          {book.rating}
        </div>
        <button className="rounded-xl bg-cps-red px-4 py-2 text-sm font-bold text-white transition hover:bg-cps-redDark">
          {book.status === "Disponível" ? "Reservar" : "Detalhes"}
        </button>
      </div>
    </article>
  );
}

export default function StudentLibraryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...Array.from(new Set(books.map((book) => book.category)))];

  const filteredBooks = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return books.filter((book) => {
      const matchesQuery = [book.title, book.author, book.category, book.location].some((value) =>
        value.toLowerCase().includes(normalized)
      );
      const matchesCategory = category === "Todos" || book.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <main className="min-h-screen lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Fechar navegação" />}

      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-cps-red px-5 text-white shadow-card lg:px-8">
          <button className="rounded-lg p-2 hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={25} />
          </button>
          <div className="hidden items-center gap-3 text-2xl font-bold tracking-wide lg:flex">
            <span className="text-3xl leading-none">‹</span>
            Conecta
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="font-semibold">Olá, João!</span>
            <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white/60 bg-slate-900">
              <UserRound size={20} />
            </div>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          <section className="border-b border-cps-line pb-7">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cps-red">Sistema do aluno</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[0.16em] text-cps-ink md:text-5xl">Biblioteca</h1>
            <p className="mt-3 max-w-3xl text-lg text-cps-muted">
              Consulte o acervo, localize livros por RFID, acompanhe empréstimos e reserve espaços de estudo.
            </p>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={BookOpen} label="Livros disponíveis" value="1.248" hint="Atualização do acervo em tempo real" />
            <StatCard icon={History} label="Empréstimos ativos" value="03" hint="Próxima devolução em 04/06" />
            <StatCard icon={DoorOpen} label="Espaços livres" value="12" hint="Salas, mesas e áreas de leitura" />
            <StatCard icon={Wifi} label="Totens online" value="04" hint="RFID e reconhecimento facial ativos" />
          </section>

          <section className="mt-8 rounded-3xl bg-white p-5 shadow-card ring-1 ring-cps-line/70">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-cps-ink">Consulta do acervo</h2>
                <p className="mt-1 text-cps-muted">Busque por título, autor, categoria ou localização.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block min-w-[260px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cps-muted" size={20} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Pesquisar livro..."
                    className="w-full rounded-2xl border border-cps-line bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-cps-red focus:bg-white"
                  />
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-2xl border border-cps-line bg-slate-50 px-4 py-3 outline-none transition focus:border-cps-red focus:bg-white"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-cps-line/70">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-cps-ink">Reserva de espaços</h2>
                  <p className="text-cps-muted">Salas, mesas individuais e áreas de leitura.</p>
                </div>
                <button className="rounded-xl bg-cps-sidebar px-4 py-2 text-sm font-bold text-white hover:bg-cps-sidebarDark">Nova reserva</button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-cps-line">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-cps-muted">
                    <tr>
                      <th className="px-5 py-4 font-bold">Espaço</th>
                      <th className="px-5 py-4 font-bold">Data</th>
                      <th className="px-5 py-4 font-bold">Horário</th>
                      <th className="px-5 py-4 font-bold">Capacidade</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cps-line">
                    {reservations.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="px-5 py-4 font-semibold text-cps-ink">{item.space}</td>
                        <td className="px-5 py-4 text-cps-muted">{item.date}</td>
                        <td className="px-5 py-4 text-cps-muted">{item.time}</td>
                        <td className="px-5 py-4 text-cps-muted">{item.capacity}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(item.status)}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-cps-sidebar p-5 text-white shadow-card">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">Mapa digital</p>
                <h2 className="mt-2 text-2xl font-bold">Localização inteligente</h2>
                <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-white/10 p-4">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <div key={index} className={`h-10 rounded-lg ${index === 5 || index === 9 ? "bg-cps-red" : "bg-white/20"}`} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/80">Os blocos em destaque simulam a rota até a estante selecionada.</p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-cps-line/70">
                <h2 className="text-2xl font-bold text-cps-ink">Notificações</h2>
                <div className="mt-4 space-y-3">
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-cps-line p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-bold text-cps-ink">{item.title}</h3>
                        <span className="rounded-full bg-cps-cyan px-3 py-1 text-xs font-bold text-cps-sidebar">{item.type}</span>
                      </div>
                      <p className="text-sm text-cps-muted">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

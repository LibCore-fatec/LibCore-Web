import { Icon } from "@/components/icons";

type TopBarProps = {
  onHomeClick: () => void;
};

export function TopBar({ onHomeClick }: TopBarProps) {
  return (
    <header className="flex h-[70px] items-center justify-between bg-[var(--cps-brand)] px-4 text-white shadow-md md:px-7">
      <button
        className="flex items-center gap-2 rounded-md text-left text-2xl font-semibold md:text-[2rem]"
        onClick={onHomeClick}
        type="button"
        aria-label="Abrir inicio do Conecta"
      >
        <Icon name="share" className="h-8 w-8 shrink-0" />
        <span>Conecta</span>
      </button>

      <span className="text-lg font-semibold md:text-xl">Olá, Visitante!</span>
    </header>
  );
}

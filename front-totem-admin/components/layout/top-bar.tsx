import { Icon } from "@/components/icons";
import type { StudentProfile } from "@/lib/types";

type TopBarProps = {
  isDark: boolean;
  student: StudentProfile;
  onHomeClick: () => void;
  onToggleTheme: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
};

export function TopBar({
  isDark,
  student,
  onHomeClick,
  onToggleTheme,
  onNotificationsClick,
  onProfileClick,
}: TopBarProps) {
  return (
    <header className="flex h-[70px] items-center justify-between bg-[var(--cps-brand)] px-4 text-white shadow-md md:px-7">
      <button
        className="flex items-center gap-2 rounded-md text-left text-2xl font-semibold md:text-[2rem]"
        onClick={onHomeClick}
        type="button"
        aria-label="Abrir início do Conecta"
      >
        <Icon name="share" className="h-8 w-8 shrink-0" />
        <span>Conecta</span>
      </button>

      <div className="flex items-center gap-3">
        <button
          className="grid h-9 w-9 place-items-center rounded-md bg-white/10 transition hover:bg-white/18"
          onClick={onToggleTheme}
          type="button"
          aria-label="Alternar modo de cor"
        >
          <Icon name={isDark ? "sun" : "moon"} className="h-5 w-5" />
        </button>
        <button
          className="relative hidden h-9 w-9 place-items-center rounded-md bg-white/10 transition hover:bg-white/18 sm:grid"
          type="button"
          aria-label="Abrir notificações"
          onClick={onNotificationsClick}
        >
          <Icon name="bell" className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-white" />
        </button>
        <span className="hidden text-lg font-semibold sm:inline">
          Olá, {student.name}!
        </span>
        <button
          className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-white bg-neutral-950 text-sm font-bold shadow"
          type="button"
          aria-label="Perfil do aluno"
          onClick={onProfileClick}
        >
          {student.initials}
        </button>
      </div>
    </header>
  );
}

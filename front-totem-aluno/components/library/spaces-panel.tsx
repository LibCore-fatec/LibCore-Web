import { Icon } from "@/components/icons";
import { InfoRow } from "@/components/ui/info-row";
import type { StudySpace } from "@/lib/types";

type SpacesPanelProps = {
  reservedSpaceIds: string[];
  studySpaces: StudySpace[];
  onReserveSpace: (spaceId: string, spaceName: string) => void;
};

export function SpacesPanel({
  reservedSpaceIds,
  studySpaces,
  onReserveSpace,
}: SpacesPanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {studySpaces.map((space) => {
        const reserved = reservedSpaceIds.includes(space.id);

        return (
          <article key={space.id} className="cps-card p-5">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--cps-accent-soft)] text-[var(--cps-accent)]">
              <Icon name="room" className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--cps-accent)]">
              {space.type}
            </p>
            <h3 className="mt-1 text-xl font-semibold">{space.name}</h3>
            <div className="mt-4 space-y-2 text-sm text-[var(--cps-text-muted)]">
              <InfoRow icon="user" text={space.capacity} />
              <InfoRow icon="clock" text={space.time} />
            </div>
            <button
              className={`mt-6 h-10 w-full rounded-md text-sm font-semibold ${
                reserved
                  ? "bg-[var(--cps-card-muted)] text-[var(--cps-text-muted)]"
                  : "bg-[var(--cps-accent)] text-white hover:opacity-90"
              }`}
              onClick={() => onReserveSpace(space.id, space.name)}
              type="button"
            >
              {reserved ? "Reservado" : "Reservar espaço"}
            </button>
          </article>
        );
      })}
    </div>
  );
}

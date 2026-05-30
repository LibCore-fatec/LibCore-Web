import type { IconName } from "@/lib/types";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className = "" }: IconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "academy":
      return (
        <svg {...common}>
          <path d="m3 9 9-4 9 4-9 4-9-4Z" />
          <path d="M6 11.5v4.2c1.8 1.8 10.2 1.8 12 0v-4.2" />
          <path d="M20 10.2v5.3" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22V4.5Z" />
          <path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H20" />
        </svg>
      );
    case "bookSearch":
      return (
        <svg {...common}>
          <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v12" />
          <path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H12" />
          <path d="M5 4.5V22" />
          <circle cx="17" cy="17" r="3" />
          <path d="m19.2 19.2 2 2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M7 3v4" />
          <path d="M17 3v4" />
          <rect width="18" height="17" x="3" y="4" rx="2" />
          <path d="M3 9h18" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevronRight":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M14 3h7v7" />
          <path d="M10 14 21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21" />
          <path d="M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M8 14a6 6 0 1 1 8 0c-1 1-1.4 2-1.4 4H9.4c0-2-.4-3-1.4-4Z" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
          <path d="M9 3v15" />
          <path d="M15 6v15" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M21 13.2A8.5 8.5 0 0 1 10.8 3 7 7 0 1 0 21 13.2Z" />
        </svg>
      );
    case "rfid":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h4" />
          <path d="M8 13h2" />
          <path d="M14 9c1.3 1.8 1.3 4.2 0 6" />
          <path d="M17 7c2.4 3.1 2.4 6.9 0 10" />
        </svg>
      );
    case "room":
      return (
        <svg {...common}>
          <path d="M4 20V5a2 2 0 0 1 2-2h10v17" />
          <path d="M16 8h4v12H4" />
          <path d="M10 12h.01" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" fill="currentColor" stroke="none" />
          <circle cx="6" cy="12" r="3" fill="currentColor" stroke="none" />
          <circle cx="18" cy="19" r="3" fill="currentColor" stroke="none" />
          <path d="m8.7 10.7 6.6-4.4" />
          <path d="m8.7 13.3 6.6 4.4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "signOut":
      return (
        <svg {...common}>
          <path d="M10 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
          <path d="M15 7l5 5-5 5" />
          <path d="M20 12H8" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2L12 3Z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.9 4.9 6.3 6.3" />
          <path d="m17.7 17.7 1.4 1.4" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m4.9 19.1 1.4-1.4" />
          <path d="m17.7 6.3 1.4-1.4" />
        </svg>
      );
    case "terminal":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m7 9 3 3-3 3" />
          <path d="M12 15h5" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...common}>
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
          <path d="M9 8v8" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    default:
      return null;
  }
}

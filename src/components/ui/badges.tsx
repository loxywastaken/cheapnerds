import { GAME_STATUS_LABELS, type GameStatus, PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const gameStatusStyle: Record<GameStatus, string> = {
  released: "text-ok bg-ok/10 border-ok/25",
  in_development: "text-warn bg-warn/10 border-warn/25",
  coming_soon: "text-blue-soft bg-blue/10 border-blue/30",
};

export function StatusBadge({ status, className }: { status: GameStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md",
        gameStatusStyle[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full bg-current", status === "released" && "animate-pulse-dot")} aria-hidden="true" />
      {GAME_STATUS_LABELS[status]}
    </span>
  );
}

const projectStatusStyle: Record<ProjectStatus, string> = {
  completed: "text-ok bg-ok/10 border-ok/25",
  in_progress: "text-warn bg-warn/10 border-warn/25",
  upcoming: "text-blue-soft bg-blue/10 border-blue/30",
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md", projectStatusStyle[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-xs text-muted", className)}>
      {children}
    </span>
  );
}

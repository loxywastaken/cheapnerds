import { Gamepad2, Glasses, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { PLATFORM_LABELS, type Platform } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const platformIcons: Record<Platform, LucideIcon> = {
  pc: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  console: Gamepad2,
  vr: Glasses,
};

export function PlatformIcons({ platforms, className }: { platforms: Platform[]; className?: string }) {
  if (platforms.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-1.5", className)} aria-label="Supported platforms">
      {platforms.map((p) => {
        const Icon = platformIcons[p];
        if (!Icon) return null;
        return (
          <li key={p} title={PLATFORM_LABELS[p]} className="grid size-7 place-items-center rounded-lg border border-line bg-white/[0.03] text-muted">
            <Icon className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{PLATFORM_LABELS[p]}</span>
          </li>
        );
      })}
    </ul>
  );
}

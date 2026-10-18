import { formatCompact, formatNumber } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export type Stat = { label: string; value: number | null | undefined; source: string; compact?: boolean };

/** Only real numbers reported by Roblox, Discord or our own database are shown. */
export function StatsStrip({ stats }: { stats: Stat[] }) {
  const shown = stats.filter((s): s is Stat & { value: number } => typeof s.value === "number" && s.value >= 0);
  if (shown.length === 0) return null;
  return (
    <Reveal>
      <dl className="panel grid grid-cols-2 divide-line overflow-hidden sm:flex sm:divide-x">
        {shown.map((stat, i) => (
          <div key={stat.label} className={`flex-1 px-5 py-6 sm:px-7 ${i % 2 === 1 ? "border-l border-line sm:border-l-0" : ""} ${i >= 2 ? "border-t border-line sm:border-t-0" : ""}`}>
            <dt className="text-xs text-subtle">{stat.label}</dt>
            <dd className="mt-1.5 font-display text-3xl font-semibold tabular-nums text-strong" title={formatNumber(stat.value)}>
              {stat.compact ? formatCompact(stat.value) : formatNumber(stat.value)}
            </dd>
            <dd className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-subtle">via {stat.source}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

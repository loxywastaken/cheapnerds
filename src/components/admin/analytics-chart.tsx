import type { AnalyticsData } from "@/lib/admin/analytics";
import { formatNumber } from "@/lib/utils";

/** Accessible bar chart of daily views, with visitors as an inner bar. Pure SVG, no client JS. */
export function AnalyticsChart({ daily }: { daily: AnalyticsData["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  const width = 720;
  const height = 180;
  const gap = 3;
  const barW = (width - gap * (daily.length - 1)) / Math.max(1, daily.length);

  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="h-auto w-full" role="img" aria-label="Daily page views for the selected period">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={width} y1={height - height * f} y2={height - height * f} stroke="rgb(255 255 255 / 0.06)" strokeDasharray="3 4" />
        ))}
        {daily.map((d, i) => {
          const h = (d.views / max) * (height - 8);
          const vh = (d.visitors / max) * (height - 8);
          const x = i * (barW + gap);
          return (
            <g key={d.day}>
              <title>{`${d.day}: ${formatNumber(d.views)} views, ${formatNumber(d.visitors)} visitors`}</title>
              <rect x={x} y={height - h} width={barW} height={Math.max(h, d.views ? 2 : 0)} rx={Math.min(4, barW / 2)} fill="rgb(255 178 26 / 0.35)" />
              <rect x={x + barW * 0.2} y={height - vh} width={barW * 0.6} height={Math.max(vh, d.visitors ? 2 : 0)} rx={Math.min(3, barW / 3)} fill="#a8cfea" />
            </g>
          );
        })}
        <text x={0} y={height + 16} fill="#6f6f80" fontSize="11">
          {daily[0]?.day}
        </text>
        <text x={width} y={height + 16} fill="#6f6f80" fontSize="11" textAnchor="end">
          {daily.at(-1)?.day}
        </text>
      </svg>
      <figcaption className="mt-3 flex gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand/40" aria-hidden="true" /> Page views
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-ice-soft" aria-hidden="true" /> Unique visitors
        </span>
      </figcaption>
    </figure>
  );
}

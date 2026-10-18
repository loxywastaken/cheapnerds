import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { AdminPageTitle } from "@/components/admin/page-title";
import { getAnalytics } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  await requireAdmin();
  const { days: raw } = await searchParams;
  const days = RANGES.find((d) => String(d) === raw) ?? 30;
  const [data, settings] = await Promise.all([getAnalytics(days), getSettings()]);

  return (
    <>
      <AdminPageTitle
        title="Analytics"
        description="Privacy-friendly page view counts. No cookies or personal data are stored; visitors are counted with a daily-rotating anonymous hash."
        actions={
          <div className="flex rounded-full border border-line bg-surface p-1 text-sm">
            {RANGES.map((d) => (
              <Link key={d} href={`/admin/analytics?days=${d}`} className={cn("rounded-full px-3.5 py-1.5", d === days ? "bg-white text-ink" : "text-muted hover:text-white")}>
                {d} days
              </Link>
            ))}
          </div>
        }
      />
      {!settings.analytics.enabled && (
        <p className="mb-6 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
          Tracking is currently turned off. Enable it in <Link href="/admin/settings" className="underline">Site settings</Link> to start collecting page views.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-5">
          <p className="text-sm text-muted">Page views</p>
          <p className="mt-1 font-display text-3xl font-semibold text-white">{formatNumber(data.views)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-muted">Unique visitors (daily)</p>
          <p className="mt-1 font-display text-3xl font-semibold text-white">{formatNumber(data.visitors)}</p>
        </div>
      </div>
      <section className="panel mt-6 p-5 sm:p-6">
        <AnalyticsChart daily={data.daily} />
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankList title="Top pages" rows={data.pages.map((r) => ({ label: r.path, value: r.views }))} empty="No page views yet." />
        <RankList title="Top referrers" rows={data.referrers.map((r) => ({ label: r.host, value: r.views }))} empty="No external referrers yet." />
      </div>
    </>
  );
}

function RankList({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="panel p-5 sm:p-6">
      <h2 className="mb-4 font-semibold text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="relative overflow-hidden rounded-lg px-3 py-2 text-sm">
              <span className="absolute inset-y-0 left-0 rounded-lg bg-brand/15" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
              <span className="relative flex justify-between gap-4">
                <span className="truncate font-mono text-xs text-fg">{r.label}</span>
                <span className="tabular-nums text-muted">{formatNumber(r.value)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

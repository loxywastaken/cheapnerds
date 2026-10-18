import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { pageViews } from "@/db/schema";

export async function getAnalytics(days = 30) {
  const since = sql`now() - make_interval(days => ${days})`;
  const [totals, daily, pages, referrers] = await Promise.all([
    db.execute<{ views: number; visitors: number }>(sql`
      select count(*)::int as views, count(distinct ${pageViews.visitorHash})::int as visitors
      from ${pageViews} where ${pageViews.createdAt} >= ${since}`),
    db.execute<{ day: string; views: number; visitors: number }>(sql`
      with days as (
        select generate_series((now() - make_interval(days => ${days - 1}))::date, now()::date, interval '1 day')::date as day
      )
      select to_char(days.day, 'YYYY-MM-DD') as day,
             count(pv.id)::int as views,
             count(distinct pv.visitor_hash)::int as visitors
      from days
      left join ${pageViews} pv on pv.created_at::date = days.day
      group by days.day order by days.day`),
    db.execute<{ path: string; views: number }>(sql`
      select ${pageViews.path} as path, count(*)::int as views from ${pageViews}
      where ${pageViews.createdAt} >= ${since}
      group by 1 order by 2 desc limit 10`),
    db.execute<{ host: string; views: number }>(sql`
      select ${pageViews.referrerHost} as host, count(*)::int as views from ${pageViews}
      where ${pageViews.createdAt} >= ${since} and ${pageViews.referrerHost} is not null
      group by 1 order by 2 desc limit 8`),
  ]);
  return {
    views: totals[0]?.views ?? 0,
    visitors: totals[0]?.visitors ?? 0,
    daily: [...daily],
    pages: [...pages],
    referrers: [...referrers],
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { ArrowRight, Boxes, Gamepad2, Image as ImageIcon, Newspaper, Plus, RefreshCw, Settings } from "lucide-react";
import { ActionButton } from "@/components/admin/action-button";
import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClass } from "@/components/ui/button";
import { db } from "@/db";
import { games, media, posts, projects } from "@/db/schema";
import { getAnalytics } from "@/lib/admin/analytics";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data";
import { getDiscordServer } from "@/lib/discord";
import { getRobloxGames, getRobloxGroup, getUniverseIdForPlace } from "@/lib/roblox";
import { formatDate, formatNumber } from "@/lib/utils";
import { refreshRobloxData } from "../actions/games";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const settings = await getSettings();
  const [[g], [p], [n], [m], analytics, recentPosts, gameRows, group, discord] = await Promise.all([
    db.select({ n: count() }).from(games),
    db.select({ n: count() }).from(projects),
    db.select({ n: count() }).from(posts),
    db.select({ n: count() }).from(media),
    getAnalytics(14),
    db.select({ id: posts.id, title: posts.title, publishedAt: posts.publishedAt, published: posts.published }).from(posts).orderBy(desc(posts.updatedAt)).limit(5),
    db.select({ universeId: games.universeId, placeId: games.placeId }).from(games).where(eq(games.published, true)),
    getRobloxGroup(settings.roblox.groupId),
    getDiscordServer(settings.discord.inviteUrl),
  ]);
  const linked = gameRows.filter((r) => r.placeId);
  const universeIds = (await Promise.all(linked.map((r) => r.universeId ?? getUniverseIdForPlace(r.placeId!)))).filter((x): x is string => !!x);
  const roblox = universeIds.length ? await getRobloxGames(universeIds) : {};
  const synced = Object.keys(roblox).length;
  const robloxOk = linked.length === 0 || synced > 0;

  const cards = [
    { label: "Games", value: g.n, href: "/admin/games", Icon: Gamepad2 },
    { label: "Projects", value: p.n, href: "/admin/projects", Icon: Boxes },
    { label: "News posts", value: n.n, href: "/admin/posts", Icon: Newspaper },
    { label: "Media files", value: m.n, href: "/admin/media", Icon: ImageIcon },
  ];

  return (
    <>
      <AdminPageTitle
        title={`Welcome back, ${admin.name.split(" ")[0]}`}
        description="Here's what's happening across the site."
        actions={
          <>
            <Link href="/admin/posts/new" className={buttonClass("accent", "sm")}>
              <Plus className="size-4" aria-hidden="true" /> New post
            </Link>
            <Link href="/admin/games/new" className={buttonClass("secondary", "sm")}>
              <Plus className="size-4" aria-hidden="true" /> Add game
            </Link>
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, href, Icon }) => (
          <li key={label}>
            <Link href={href} className="panel group flex flex-col p-5 transition-colors hover:border-line-strong">
              <Icon className="size-5 text-brand-soft" aria-hidden="true" />
              <span className="mt-4 font-display text-3xl font-semibold text-white">{formatNumber(value)}</span>
              <span className="mt-0.5 flex items-center justify-between text-sm text-muted">
                {label} <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Traffic · last 14 days</h2>
              <p className="text-sm text-muted">
                {formatNumber(analytics.views)} views · {formatNumber(analytics.visitors)} visitors
                {!settings.analytics.enabled && " · tracking is turned off in settings"}
              </p>
            </div>
            <Link href="/admin/analytics" className="text-sm text-brand-soft hover:text-white">
              Details →
            </Link>
          </div>
          <AnalyticsChart daily={analytics.daily} />
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Integrations</h2>
            <ActionButton action={refreshRobloxData} className="rounded-lg px-2.5 py-1.5 text-xs text-muted hover:bg-white/10 hover:text-white" title="Refresh Roblox & Discord data">
              <RefreshCw className="size-3.5" aria-hidden="true" /> Refresh
            </ActionButton>
          </div>
          <ul className="space-y-3 text-sm">
            <Status ok={robloxOk} label="Roblox games API" detail={linked.length === 0 ? "No games linked to Roblox yet" : synced > 0 ? `${synced} of ${linked.length} game(s) synced` : "Unreachable — showing saved data"} />
            <Status
              ok={!!group}
              label="Roblox group"
              detail={group ? `${group.name}${group.memberCount != null ? ` · ${formatNumber(group.memberCount)} members` : ""}` : settings.roblox.groupId ? "Couldn't load group" : "Not configured"}
            />
            <Status
              ok={!!discord}
              label="Discord invite"
              detail={discord ? `${discord.name}${discord.memberCount != null ? ` · ${formatNumber(discord.memberCount)} members` : ""}` : settings.discord.inviteUrl ? "Couldn't load invite" : "Not configured"}
            />
          </ul>
          <Link href="/admin/settings" className={buttonClass("secondary", "sm", "mt-5 w-full")}>
            <Settings className="size-4" aria-hidden="true" /> Edit links & settings
          </Link>
        </section>
      </div>

      <section className="panel mt-6 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recently edited posts</h2>
          <Link href="/admin/posts" className="text-sm text-brand-soft hover:text-white">
            All posts →
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-muted">No posts yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/admin/posts/${post.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-white">
                  <span className="truncate text-fg">{post.title}</span>
                  <span className="shrink-0 text-xs text-subtle">{post.published ? formatDate(post.publishedAt) : "Draft"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Status({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${ok ? "bg-ok" : "bg-warn"}`} aria-hidden="true" />
      <span>
        <span className="block text-fg">{label}</span>
        <span className="block text-xs text-subtle">{detail}</span>
      </span>
    </li>
  );
}

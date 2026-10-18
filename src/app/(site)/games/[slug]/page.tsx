import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock, Eye, Heart, History, Tag, ThumbsUp, Users } from "lucide-react";
import { Gallery } from "@/components/site/gallery";
import { platformIcons } from "@/components/site/platform-icons";
import { PostCard } from "@/components/site/post-card";
import { StatusBadge } from "@/components/ui/badges";
import { buttonClass } from "@/components/ui/button";
import { RobloxIcon } from "@/components/ui/icons";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { PLATFORM_LABELS } from "@/lib/constants";
import { getGame, getGameUpdates, getPosts, getPublishedGameRows, getSettings } from "@/lib/data";
import { formatDate, formatNumber, plainText, toIsoDate } from "@/lib/utils";
import { GameDetailSkeleton } from "./skeleton";

export async function generateStaticParams() {
  const rows = await getPublishedGameRows();
  // Cache Components needs at least one param to validate the route at build time.
  return rows.length ? rows.map((g) => ({ slug: g.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: "Game not found" };
  const description = game.tagline || plainText(game.description, 160) || `Play ${game.name} on Roblox.`;
  return {
    title: game.name,
    description,
    openGraph: { title: game.name, description, type: "website" },
    alternates: { canonical: `/games/${game.slug}` },
  };
}

export default function GamePage({ params }: PageProps<"/games/[slug]">) {
  return (
    <Suspense fallback={<GameDetailSkeleton />}>
      <GameDetail params={params} />
    </Suspense>
  );
}

async function GameDetail({ params }: Pick<PageProps<"/games/[slug]">, "params">) {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();

  const [updates, posts, settings] = await Promise.all([getGameUpdates(game.id), getPosts({ gameId: game.id, limit: 3 }), getSettings()]);

  const stats = game.stats
    ? [
        { label: "Playing now", value: game.stats.playing, Icon: Users },
        { label: "Visits", value: game.stats.visits, Icon: Eye },
        { label: "Favourites", value: game.stats.favorites, Icon: Heart },
        { label: "Like ratio", value: game.stats.likeRatio, Icon: ThumbsUp, suffix: "%" },
      ].filter((s) => s.value != null)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.tagline || plainText(game.description, 300),
    image: game.thumbnailUrl ?? undefined,
    url: game.playUrl ?? undefined,
    gamePlatform: "Roblox",
    author: { "@type": "Organization", name: settings.siteName },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="relative isolate overflow-hidden border-b border-line">
        {game.thumbnailUrl && (
          <Image src={game.thumbnailUrl} alt="" fill sizes="100vw" className="-z-20 scale-110 object-cover opacity-30 blur-2xl" preload />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" aria-hidden="true" />
        <div className="container-page pb-12 pt-28 sm:pt-36">
          <Link href="/games" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white">
            <ArrowLeft className="size-4" aria-hidden="true" /> All games
          </Link>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-3xl border border-white/15 bg-surface-3 shadow-2xl shadow-black/50 sm:size-32">
                {game.iconUrl ? (
                  <Image src={game.iconUrl} alt={`${game.name} icon`} fill sizes="128px" className="object-cover" preload />
                ) : (
                  <span className="grid size-full place-items-center font-display text-4xl text-white/40">{game.name[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <StatusBadge status={game.status} />
                <h1 className="mt-3 text-4xl font-semibold text-white sm:text-6xl">{game.name}</h1>
                {game.tagline && <p className="mt-2 max-w-xl text-lg text-muted">{game.tagline}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {game.playUrl && (
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
                  <RobloxIcon size={17} />
                  {game.status === "released" ? "Play Now" : "View on Roblox"}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              )}
              {settings.roblox.groupUrl && (
                <a href={settings.roblox.groupUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "lg")}>
                  Join Group
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-10 pt-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div className="min-w-0 space-y-14">
          {game.gallery.length > 0 && (
            <Reveal>
              <Gallery images={game.gallery} title={game.name} />
            </Reveal>
          )}

          <section aria-labelledby="about">
            <h2 id="about" className="mb-5 text-2xl font-semibold text-white">
              About the game
            </h2>
            {game.description ? <Markdown>{game.description}</Markdown> : <p className="text-muted">More details coming soon.</p>}
          </section>

          <section aria-labelledby="update-log">
            <h2 id="update-log" className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white">
              <History className="size-5 text-violet-soft" aria-hidden="true" /> Update log
            </h2>
            {updates.length === 0 ? (
              <p className="panel px-6 py-8 text-sm text-muted">No update notes have been posted yet.</p>
            ) : (
              <ol className="relative space-y-6 border-l border-line pl-6 sm:pl-8">
                {updates.map((update, i) => (
                  <Reveal as="li" key={update.id} delay={Math.min(i, 4) * 0.05} className="relative">
                    <span
                      className={`absolute -left-[1.84rem] top-6 size-3 rounded-full border-2 border-ink sm:-left-[2.34rem] ${i === 0 ? "bg-violet-soft shadow-[0_0_12px_rgb(185_163_255/0.8)]" : "bg-surface-3"}`}
                      aria-hidden="true"
                    />
                    <div className="panel p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {update.version && <span className="rounded-md bg-violet/15 px-2 py-0.5 font-mono text-violet-soft">{update.version}</span>}
                        <time dateTime={toIsoDate(update.publishedAt)} className="text-subtle">
                          {formatDate(update.publishedAt)}
                        </time>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">{update.title}</h3>
                      {update.body && <Markdown className="mt-3 !text-[0.95rem]">{update.body}</Markdown>}
                    </div>
                  </Reveal>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {stats.length > 0 && (
            <div className="panel p-5">
              <h2 className="mb-4 flex items-center justify-between text-sm font-medium text-white">
                Live stats <span className="font-mono text-[0.62rem] uppercase tracking-wider text-subtle">via Roblox</span>
              </h2>
              <dl className="grid grid-cols-2 gap-3">
                {stats.map(({ label, value, Icon, suffix }) => (
                  <div key={label} className="rounded-2xl bg-surface-2 p-3.5">
                    <dt className="flex items-center gap-1.5 text-xs text-subtle">
                      <Icon className="size-3.5" aria-hidden="true" /> {label}
                    </dt>
                    <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-white">
                      {formatNumber(value as number)}
                      {suffix}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="panel divide-y divide-line">
            <InfoRow icon={<Tag className="size-4" />} label="Genre" value={game.genre || "—"} />
            <InfoRow icon={<Clock className="size-4" />} label="Last updated" value={game.lastUpdated ? formatDate(game.lastUpdated) : "—"} />
            {game.releaseDate && <InfoRow icon={<CalendarDays className="size-4" />} label="Released" value={formatDate(game.releaseDate)} />}
            <div className="p-5">
              <p className="text-xs text-subtle">Platforms</p>
              {game.platforms.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {game.platforms.map((p) => {
                    const Icon = platformIcons[p];
                    return (
                      <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-fg">
                        {Icon && <Icon className="size-3.5 text-muted" aria-hidden="true" />}
                        {PLATFORM_LABELS[p]}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-fg">—</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {posts.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="related-news">
          <h2 id="related-news" className="mb-6 text-2xl font-semibold text-white">
            News about {game.name}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <span className="flex items-center gap-2 text-xs text-subtle">
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className="text-right text-sm text-fg">{value}</span>
    </div>
  );
}

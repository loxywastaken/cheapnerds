import Link from "next/link";
import { ArrowRight, Clock, Gamepad2, Newspaper } from "lucide-react";
import { DiscordPromo, GroupPromo } from "@/components/site/community";
import { GameCard } from "@/components/site/game-card";
import { Hero } from "@/components/site/hero";
import { PostCard } from "@/components/site/post-card";
import { ProjectCard } from "@/components/site/project-card";
import { StatsStrip } from "@/components/site/stats-strip";
import { buttonClass } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getGames, getPosts, getProjects, getSettings } from "@/lib/data";
import { getDiscordServer } from "@/lib/discord";
import { getRobloxGroup } from "@/lib/roblox";
import { formatDate, toIsoDate } from "@/lib/utils";

export default async function HomePage() {
  const settings = await getSettings();
  const [games, posts, projects, group, discord] = await Promise.all([
    getGames(),
    getPosts({ limit: 4 }),
    getProjects(),
    getRobloxGroup(settings.roblox.groupId),
    getDiscordServer(settings.discord.inviteUrl),
  ]);

  const featured =
    games.find((g) => g.id === settings.hero.featuredGameId) ?? games.find((g) => g.featured) ?? games[0] ?? null;
  const featuredGames = (games.some((g) => g.featured) ? games.filter((g) => g.featured) : games).slice(0, 3);
  const recentlyUpdated = [...games].sort((a, b) => b.updatedSortKey.localeCompare(a.updatedSortKey)).slice(0, 4);

  const withStats = games.filter((g) => g.stats);
  const sum = (key: "visits" | "playing") =>
    withStats.some((g) => g.stats?.[key] != null) ? withStats.reduce((t, g) => t + (g.stats?.[key] ?? 0), 0) : null;

  const [leadPost, ...otherPosts] = posts;

  return (
    <>
      <Hero settings={settings} featured={featured} />

      <div className="container-page -mt-6 space-y-28 sm:space-y-36">
        <StatsStrip
          stats={[
            { label: "Group members", value: group?.memberCount, source: "Roblox", compact: true },
            { label: "Total game visits", value: sum("visits"), source: "Roblox", compact: true },
            { label: "Playing right now", value: sum("playing"), source: "Roblox" },
            { label: "Discord members", value: discord?.memberCount, source: "Discord", compact: true },
          ]}
        />

        <section aria-labelledby="featured-games">
          <SectionHeading
            eyebrow="01 — Our games"
            title={<span id="featured-games">Featured games</span>}
            description="Experiences we've designed, built and shipped on Roblox."
            action={
              <Link href="/games" className={buttonClass("secondary", "md")}>
                All games <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10">
            {featuredGames.length > 0 ? (
              featuredGames.length === 1 ? (
                <Reveal>
                  <GameCard game={featuredGames[0]} layout="wide" />
                </Reveal>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredGames.map((game, i) => (
                    <Reveal as="li" key={game.id} delay={i * 0.08}>
                      <GameCard game={game} />
                    </Reveal>
                  ))}
                </ul>
              )
            ) : (
              <EmptyState icon={Gamepad2} title="Games are on the way">
                Our first experiences are being built right now. Join the community to hear the moment they launch.
              </EmptyState>
            )}
          </div>
        </section>

        <section aria-labelledby="studio" className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-3">02 — The studio</p>
            <h2 id="studio" className="text-3xl font-semibold text-white sm:text-4xl">
              {settings.about.title}
            </h2>
            <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted">{settings.about.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/work" className={buttonClass("secondary", "md")}>
                See our work <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="panel p-2">
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                  <Clock className="size-4 text-violet-soft" aria-hidden="true" /> Recently updated
                </h3>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-subtle">Live from Roblox</span>
              </div>
              {recentlyUpdated.length > 0 ? (
                <ul>
                  {recentlyUpdated.map((game) => (
                    <li key={game.id}>
                      <Link href={`/games/${game.slug}`} className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white/[0.04]">
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-32">
                          <CoverImage src={game.thumbnailUrl} alt="" sizes="128px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{game.name}</p>
                          <p className="mt-0.5 truncate text-sm text-muted">{game.tagline || game.genre}</p>
                        </div>
                        {game.lastUpdated && (
                          <time dateTime={toIsoDate(game.lastUpdated)} className="hidden shrink-0 text-xs text-subtle sm:block">
                            {formatDate(game.lastUpdated)}
                          </time>
                        )}
                        <ArrowRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 pb-6 pt-2 text-sm text-muted">Nothing here yet — check back soon.</p>
              )}
            </div>
            {projects.length > 0 && (
              <ul className="mt-5 grid gap-5 sm:grid-cols-2">
                {projects.slice(0, 2).map((project) => (
                  <li key={project.id}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </section>

        <section aria-labelledby="latest-news">
          <SectionHeading
            eyebrow="03 — Updates"
            title={<span id="latest-news">Latest announcements</span>}
            description="Releases, patch notes, dev progress and community news."
            action={
              <Link href="/updates" className={buttonClass("secondary", "md")}>
                All updates <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10">
            {leadPost ? (
              <div className="grid gap-5 lg:grid-cols-3">
                <Reveal className="lg:col-span-3">
                  <PostCard post={leadPost} variant="large" />
                </Reveal>
                {otherPosts.map((post, i) => (
                  <Reveal key={post.id} delay={i * 0.08}>
                    <PostCard post={post} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState icon={Newspaper} title="No announcements yet">
                News and patch notes will appear here.
              </EmptyState>
            )}
          </div>
        </section>

        <section aria-labelledby="roblox-group">
          <SectionHeading
            eyebrow="04 — Roblox group"
            title={<span id="roblox-group">Be part of the group</span>}
            description="Join the official group for perks, early access and update shouts."
            className="mb-10"
          />
          <GroupPromo settings={settings} group={group} withReasons={false} />
        </section>

        <section aria-labelledby="discord">
          <SectionHeading
            eyebrow="05 — Discord"
            title={<span id="discord">Hang out with us</span>}
            description="The Discord is where the community lives — come say hi."
            className="mb-10"
          />
          <DiscordPromo settings={settings} server={discord} />
        </section>
      </div>
    </>
  );
}

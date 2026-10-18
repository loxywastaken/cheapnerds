import { Gamepad2, Newspaper } from "lucide-react";
import { DiscordCard, GroupCard } from "@/components/site/community";
import { GameCard } from "@/components/site/game-card";
import { Hero } from "@/components/site/hero";
import { PostCard } from "@/components/site/post-card";
import { ProjectCard } from "@/components/site/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading, TextLink } from "@/components/ui/section-heading";
import { getGames, getPosts, getProjects, getSettings } from "@/lib/data";
import { getDiscordServer } from "@/lib/discord";
import { getRobloxGroup } from "@/lib/roblox";

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
  // The hero already shows one game, so this section lists the others.
  const otherGames = games.filter((g) => g.id !== featured?.id);
  const moreGames = [...otherGames.filter((g) => g.featured), ...otherGames.filter((g) => !g.featured)].slice(0, 3);
  const latestProjects = [...projects].sort((a, b) => +b.updatedAt - +a.updatedAt).slice(0, 2);
  const [leadPost, ...otherPosts] = posts;

  return (
    <>
      <Hero settings={settings} featured={featured} groupMembers={group?.memberCount} discordMembers={discord?.memberCount} />

      <div className="container-page space-y-28 sm:space-y-32">
        {(moreGames.length > 0 || !featured) && (
          <section aria-labelledby="our-games">
            <SectionHeading title={<span id="our-games">More games</span>} action={<TextLink href="/games">See all games</TextLink>} />
            <div className="mt-8">
              {moreGames.length === 0 ? (
                <EmptyState icon={Gamepad2} title="Nothing out yet">
                  We&apos;re working on it. Hop in the Discord to follow along.
                </EmptyState>
              ) : moreGames.length === 1 ? (
                <Reveal>
                  <GameCard game={moreGames[0]} layout="wide" />
                </Reveal>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {moreGames.map((game, i) => (
                    <Reveal as="li" key={game.id} delay={i * 0.08}>
                      <GameCard game={game} />
                    </Reveal>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="who-we-are" className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <Reveal className="lg:pt-6">
            <h2 id="who-we-are" className="text-3xl font-bold text-strong sm:text-[2.75rem]">
              {settings.about.title}
            </h2>
            <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-strong/80">{settings.about.body}</p>
            <p className="mt-6">
              <TextLink href="/work">Stuff we&apos;ve made</TextLink>
            </p>
          </Reveal>
          {latestProjects.length > 0 && (
            <ul className="grid gap-6 sm:grid-cols-2">
              {latestProjects.map((project, i) => (
                <Reveal as="li" key={project.id} delay={i * 0.08} className={i === 1 ? "sm:mt-10" : undefined}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="news">
          <SectionHeading title={<span id="news">News</span>} action={<TextLink href="/updates">All posts</TextLink>} />
          <div className="mt-8">
            {leadPost ? (
              <div className="grid gap-6 lg:grid-cols-3">
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
              <EmptyState icon={Newspaper} title="No posts yet">
                Updates and patch notes will show up here.
              </EmptyState>
            )}
          </div>
        </section>

        <section aria-labelledby="hang-out">
          <SectionHeading title={<span id="hang-out">Come hang out</span>} description="Join the group for in-game perks, and the Discord to actually talk to us." />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <GroupCard settings={settings} group={group} className="h-full" />
            </Reveal>
            <Reveal delay={0.08} className="h-full">
              <DiscordCard settings={settings} server={discord} className="h-full" />
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { FilterableGrid } from "@/components/site/filterable-grid";
import { GameCard } from "@/components/site/game-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader, SectionHeading } from "@/components/ui/section-heading";
import { GAME_STATUSES, GAME_STATUS_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { getGames } from "@/lib/data";

export const metadata: Metadata = {
  title: "Games",
  description: "Every Roblox game made by Cheap Nerds: what's out now, what we're building and what's coming next.",
};

export default async function GamesPage() {
  const games = await getGames();
  const featured = games.filter((g) => g.featured);

  return (
    <>
      <PageHeader title="Games" description="Everything we've put out on Roblox, plus what we're still building." />
      <div className="container-page space-y-20 pt-6">
        {games.length === 0 ? (
          <EmptyState icon={Gamepad2} title="No games published yet">
            We&apos;re hard at work on our first experiences. Check back soon or join our Discord for sneak peeks.
          </EmptyState>
        ) : (
          <>
            {featured.length > 0 && (
              <section aria-labelledby="featured">
                <SectionHeading title={<span id="featured">Featured</span>} className="mb-8" />
                {featured.length === 1 ? (
                  <Reveal>
                    <GameCard game={featured[0]} layout="wide" preload />
                  </Reveal>
                ) : (
                  <ul className="grid gap-5 md:grid-cols-2">
                    {featured.slice(0, 2).map((game, i) => (
                      <Reveal as="li" key={game.id} delay={i * 0.08}>
                        <GameCard game={game} preload={i === 0} />
                      </Reveal>
                    ))}
                  </ul>
                )}
              </section>
            )}
            <section aria-labelledby="all-games">
              <SectionHeading title={<span id="all-games">All games</span>} className="mb-8" />
              <FilterableGrid
                searchPlaceholder="Search games…"
                emptyLabel="No games match that search."
                filters={GAME_STATUSES.map((s) => ({ value: s, label: GAME_STATUS_LABELS[s] }))}
                items={games.map((game) => ({
                  id: game.id,
                  filter: game.status,
                  searchText: [game.name, game.tagline, game.genre, game.description.slice(0, 400), ...game.platforms.map((p) => PLATFORM_LABELS[p])].join(" "),
                  node: <GameCard game={game} />,
                }))}
              />
            </section>
          </>
        )}
      </div>
    </>
  );
}

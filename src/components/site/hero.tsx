import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badges";
import { buttonClass } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";
import type { GameView } from "@/lib/data";
import type { SiteSettings } from "@/lib/settings";
import { formatCompact, formatNumber } from "@/lib/utils";
import { HeroIntro } from "./hero-intro";
import { LowPolyCube, LowPolyGem } from "./low-poly";
import { Particles } from "./particles";

/** Renders the site name inside the heading in the logo's bubbly gold/ice lettering. */
function highlightName(title: string, name: string) {
  const index = title.indexOf(name);
  if (!name || index === -1) return title;
  const [first, ...rest] = name.split(" ");
  return (
    <>
      {title.slice(0, index)}
      <span className="mt-1 block font-bold uppercase leading-[0.95] tracking-wide sm:mt-2">
        <span className="text-outline-gold">{first}</span>
        {rest.length > 0 && <span className="text-outline-ice"> {rest.join(" ")}</span>}
      </span>
      {title.slice(index + name.length)}
    </>
  );
}

export function Hero({
  settings,
  featured,
  groupMembers,
  discordMembers,
}: {
  settings: SiteSettings;
  featured: GameView | null;
  groupMembers?: number | null;
  discordMembers?: number | null;
}) {
  // Only real numbers from Roblox / Discord; the line disappears when neither is available.
  const counts = [
    groupMembers != null && `${formatNumber(groupMembers)} in the Roblox group`,
    discordMembers != null && `${formatNumber(discordMembers)} on Discord`,
  ].filter(Boolean);
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute left-[24%] top-[44%] -z-20 size-[170vmax] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="sunburst size-full animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute left-[24%] top-[44%] -z-10 h-[40rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.55),rgb(255_255_255/0.15)_55%,transparent)]" aria-hidden="true" />
      <Particles className="absolute inset-0 -z-10 size-full" />
      <FloatingShapes />

      <div className="container-page grid min-h-[100svh] items-center gap-14 pb-20 pt-32 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-28">
        <HeroIntro>
          <h1 className="text-outline-white text-[2.9rem] font-bold leading-[1.02] sm:text-6xl lg:text-[5.25rem]">
            {highlightName(settings.hero.title, settings.siteName)}
          </h1>
          <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-strong/80 sm:text-xl">{settings.hero.subtitle}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/games" className={buttonClass("primary", "lg")}>
              Explore Our Games
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/community" className={buttonClass("secondary", "lg")}>
              Join Our Community
            </Link>
          </div>
          {counts.length > 0 && <p className="mt-6 font-display text-[0.95rem] font-semibold text-strong/75">{counts.join("  ·  ")}</p>}
        </HeroIntro>

        {featured && <FeaturedShowcase game={featured} />}
      </div>
    </section>
  );
}

function FeaturedShowcase({ game }: { game: GameView }) {
  return (
    <HeroIntro delay={0.15} className="relative">
      <div className="animate-float rotate-[1.5deg] [animation-duration:7s]">
        <div className="group panel overflow-hidden p-2">
          <div className="relative aspect-video overflow-hidden rounded-[1.1rem] border-[3px] border-outline bg-surface-2">
            <CoverImage src={game.thumbnailUrl} alt={`${game.name} thumbnail`} sizes="(min-width: 1024px) 600px, 100vw" preload />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" aria-hidden="true" />
            <span className="absolute left-3 top-3 -rotate-3 rounded-full border-[2.5px] border-outline bg-[#ffd43b] px-3 py-0.5 font-display text-sm font-bold text-outline shadow-[0_2px_0_var(--color-outline)]">
              Featured
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 sm:p-5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border-[3px] border-outline bg-surface-3 shadow-[0_3px_0_var(--color-outline)] sm:size-16">
                {game.iconUrl && <Image src={game.iconUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-white sm:text-2xl">{game.name}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={game.status} className="bg-ink/50" />
                  {game.stats?.playing != null && game.stats.playing > 0 && (
                    <span className="text-xs text-fg/80">{formatCompact(game.stats.playing)} playing now</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-3.5">
            <p className="line-clamp-1 text-sm text-muted">{game.tagline}</p>
            <div className="flex shrink-0 gap-2">
              <Link href={`/games/${game.slug}`} className={buttonClass("ghost", "sm")}>
                Details
              </Link>
              {game.playUrl && (
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "sm")}>
                  {game.status === "released" ? "Play Now" : "View"}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </HeroIntro>
  );
}

/** Low-poly gems and a blocky pet bobbing around the hero (decorative only). */
function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden sm:block" aria-hidden="true">
      <LowPolyGem color="ice" className="absolute left-[44%] top-[15%] w-10 rotate-12 animate-float [animation-duration:6s]" />
      <LowPolyGem color="pink" className="absolute bottom-[12%] right-[5%] w-14 -rotate-12 animate-float [animation-delay:-3s] [animation-duration:8s]" />
      <LowPolyCube className="absolute bottom-[14%] left-[40%] w-16 rotate-6 animate-float [animation-delay:-5s] [animation-duration:7.5s]" />
    </div>
  );
}

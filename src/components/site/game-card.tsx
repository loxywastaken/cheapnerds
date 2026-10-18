import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui/badges";
import { buttonClass } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { GameView } from "@/lib/data";
import { cn, formatCompact } from "@/lib/utils";
import { PlatformIcons } from "./platform-icons";

export function GameCard({ game, preload, layout = "card" }: { game: GameView; preload?: boolean; layout?: "card" | "wide" }) {
  const wide = layout === "wide";
  return (
    <SpotlightCard
      className={cn(
        "group flex h-full flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
        wide && "lg:flex-row",
      )}
    >
      <div className={cn("relative aspect-video overflow-hidden bg-surface-2", wide ? "lg:w-[58%] lg:shrink-0" : "rounded-t-[inherit]")}>
        <CoverImage
          src={game.thumbnailUrl}
          alt={`${game.name} thumbnail`}
          sizes={wide ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
          preload={preload}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent", wide && "lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-surface/70")} aria-hidden="true" />
        <StatusBadge status={game.status} className="absolute left-3 top-3 bg-ink/60" />
        {game.stats?.playing != null && game.stats.playing > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/60 px-2.5 py-1 text-xs text-white backdrop-blur-md">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-ok" aria-hidden="true" />
            {formatCompact(game.stats.playing)} playing
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col px-5 pb-5", wide && "lg:justify-center lg:p-10")}>
        <div className={cn("-mt-8 mb-3 flex items-end justify-between gap-3", wide && "lg:mt-0 lg:mb-6")}>
          <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-surface bg-surface-3 shadow-xl shadow-black/40">
            {game.iconUrl ? (
              <Image src={game.iconUrl} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <span className="grid size-full place-items-center font-display text-xl font-semibold text-white/50">{game.name.slice(0, 1)}</span>
            )}
          </div>
          <PlatformIcons platforms={game.platforms} />
        </div>

        <h3 className={cn("text-xl font-semibold text-white", wide && "lg:text-3xl")}>
          <Link href={`/games/${game.slug}`} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
            {game.name}
          </Link>
        </h3>
        {(game.tagline || game.description) && (
          <p className={cn("mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted", wide && "lg:mt-3 lg:line-clamp-4 lg:text-base")}>{game.tagline || game.description}</p>
        )}

        <div className={cn("mt-auto flex items-center justify-between gap-3 pt-5", wide && "lg:mt-8")}>
          <div className="flex items-center gap-4 text-xs text-subtle">
            {game.stats?.visits != null && game.stats.visits > 0 && (
              <span className="inline-flex items-center gap-1.5" title="Total visits">
                <Eye className="size-3.5" aria-hidden="true" />
                {formatCompact(game.stats.visits)} visits
              </span>
            )}
            {game.stats?.favorites != null && game.stats.favorites > 0 && (
              <span className="inline-flex items-center gap-1.5" title="Favourites">
                <Users className="size-3.5" aria-hidden="true" />
                {formatCompact(game.stats.favorites)}
              </span>
            )}
          </div>
          {game.playUrl && game.status === "released" ? (
            <a
              href={game.playUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary", "sm", "relative z-[3]")}
            >
              Play
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-xs font-medium text-brand">View details →</span>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

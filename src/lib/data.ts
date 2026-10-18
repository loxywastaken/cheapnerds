import "server-only";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { gameUpdates, games, posts, projects, settings, type Game } from "@/db/schema";
import { CACHE_TAGS, type GameStatus, type Platform, type PostCategory } from "./constants";
import { getRobloxGames, getUniverseIdForPlace, robloxPlayUrl, type RobloxGame } from "./roblox";
import { parseSettings, type SiteSettings } from "./settings";

/*
 * Public, cached read layer. Every function here is tagged so admin mutations can
 * invalidate exactly what changed (see lib/revalidate.ts).
 */

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.settings);
  const row = await db.query.settings.findFirst({ where: eq(settings.key, "site") });
  return parseSettings(row?.value);
}

const gameOrder = [desc(games.featured), asc(games.sortOrder), asc(games.name)];

export async function getPublishedGameRows(): Promise<Game[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.games);
  return db.select().from(games).where(eq(games.published, true)).orderBy(...gameOrder);
}

export async function getGameRowBySlug(slug: string): Promise<Game | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.games);
  const row = await db.query.games.findFirst({ where: and(eq(games.slug, slug), eq(games.published, true)) });
  return row ?? null;
}

export async function getGameUpdates(gameId: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.games);
  return db.select().from(gameUpdates).where(eq(gameUpdates.gameId, gameId)).orderBy(desc(gameUpdates.publishedAt)).limit(50);
}

export type GameStats = {
  playing: number | null;
  visits: number | null;
  favorites: number | null;
  likeRatio: number | null;
};

export type GameView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: GameStatus;
  platforms: Platform[];
  genre: string;
  featured: boolean;
  placeId: string | null;
  playUrl: string | null;
  iconUrl: string | null;
  thumbnailUrl: string | null;
  gallery: string[];
  /** Last update date reported by Roblox; null when unknown (we never substitute our own edit time). */
  lastUpdated: string | null;
  /** Sort key for "recently updated": Roblox's date, falling back to when we last edited the game. */
  updatedSortKey: string;
  releaseDate: string | null;
  stats: GameStats | null;
};

function toGameView(game: Game, roblox: RobloxGame | undefined): GameView {
  const robloxThumbs = roblox?.thumbnails ?? [];
  const gallery = [...new Set([...game.screenshots, ...robloxThumbs])];
  const votes = (roblox?.upVotes ?? 0) + (roblox?.downVotes ?? 0);
  const stats: GameStats | null =
    game.showStats && roblox
      ? {
          playing: roblox.playing,
          visits: roblox.visits,
          favorites: roblox.favorites,
          likeRatio: votes > 0 ? Math.round(((roblox.upVotes ?? 0) / votes) * 100) : null,
        }
      : null;

  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    tagline: game.tagline,
    description: game.description || roblox?.description || "",
    status: game.status,
    platforms: game.platforms as Platform[],
    genre: game.genre || (roblox?.genre && roblox.genre !== "All" ? roblox.genre : ""),
    featured: game.featured,
    placeId: game.placeId,
    playUrl: robloxPlayUrl(game.placeId),
    iconUrl: game.iconUrl || roblox?.iconUrl || null,
    thumbnailUrl: game.thumbnailUrl || robloxThumbs[0] || game.screenshots[0] || null,
    gallery,
    lastUpdated: roblox?.updated ?? null,
    updatedSortKey: roblox?.updated ?? game.updatedAt.toISOString(),
    releaseDate: game.releaseDate?.toISOString() ?? null,
    stats,
  };
}

async function universeIdOf(game: Game) {
  if (game.universeId) return game.universeId;
  return game.placeId ? getUniverseIdForPlace(game.placeId) : null;
}

export async function getGames(): Promise<GameView[]> {
  const rows = await getPublishedGameRows();
  const universeIds = await Promise.all(rows.map(universeIdOf));
  const roblox = await getRobloxGames(universeIds.filter((id): id is string => !!id));
  return rows.map((g, i) => toGameView(g, universeIds[i] ? roblox[universeIds[i]] : undefined));
}

export async function getGame(slug: string): Promise<GameView | null> {
  const row = await getGameRowBySlug(slug);
  if (!row) return null;
  const universeId = await universeIdOf(row);
  const roblox = universeId ? await getRobloxGames([universeId]) : {};
  return toGameView(row, universeId ? roblox[universeId] : undefined);
}

export async function getProjects() {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.projects);
  return db
    .select()
    .from(projects)
    .where(eq(projects.published, true))
    .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.projects);
  const row = await db.query.projects.findFirst({ where: and(eq(projects.slug, slug), eq(projects.published, true)) });
  return row ?? null;
}

export async function getPosts(options: { limit?: number; category?: PostCategory; gameId?: string } = {}) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.posts);
  const filters = [eq(posts.published, true)];
  if (options.category) filters.push(eq(posts.category, options.category));
  if (options.gameId) filters.push(eq(posts.gameId, options.gameId));
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      coverUrl: posts.coverUrl,
      category: posts.category,
      pinned: posts.pinned,
      publishedAt: posts.publishedAt,
      gameId: posts.gameId,
    })
    .from(posts)
    .where(and(...filters))
    .orderBy(desc(posts.pinned), desc(posts.publishedAt))
    .limit(options.limit ?? 100);
}

export type PostSummary = Awaited<ReturnType<typeof getPosts>>[number];

export async function getPost(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.posts);
  const row = await db.query.posts.findFirst({ where: and(eq(posts.slug, slug), eq(posts.published, true)) });
  return row ?? null;
}

export async function getRelatedPosts(slug: string, limit = 3) {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.posts);
  return db
    .select({ slug: posts.slug, title: posts.title, category: posts.category, publishedAt: posts.publishedAt, coverUrl: posts.coverUrl, excerpt: posts.excerpt })
    .from(posts)
    .where(and(eq(posts.published, true), ne(posts.slug, slug)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "./constants";

/**
 * Server-side Roblox Web API integration. All calls go through our server (never the
 * browser), are cached with `use cache`, and degrade gracefully to `null` when Roblox
 * is unreachable so pages still render with the data stored in our database.
 */

const TIMEOUT_MS = 8000;
const UA = "CheapNerdsWebsite/1.0 (+https://github.com/loxywastaken/cheapnerds)";

export class RobloxError extends Error {}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new RobloxError(`Roblox API ${res.status} for ${new URL(url).pathname}`);
  return (await res.json()) as T;
}

const isId = (value: string | null | undefined): boolean => !!value && /^\d{1,20}$/.test(value);

/** Lifetime used when Roblox fails, so we retry soon instead of caching the failure for long. */
const FAILURE_LIFE = { stale: 300, revalidate: 60, expire: 3600 } as const;

export type RobloxGame = {
  universeId: string;
  placeId: string;
  name: string;
  description: string;
  creatorName: string;
  genre: string;
  playing: number | null;
  visits: number | null;
  favorites: number | null;
  maxPlayers: number | null;
  upVotes: number | null;
  downVotes: number | null;
  created: string | null;
  updated: string | null;
  iconUrl: string | null;
  thumbnails: string[];
};

type GamesResponse = {
  data: {
    id: number;
    rootPlaceId: number;
    name: string;
    description: string | null;
    creator?: { name?: string };
    genre?: string;
    playing?: number;
    visits?: number;
    favoritedCount?: number;
    maxPlayers?: number;
    created?: string;
    updated?: string;
  }[];
};
type ThumbResponse = { data: { targetId: number; state: string; imageUrl: string | null }[] };
type MultiThumbResponse = { data: { universeId: number; thumbnails: { state: string; imageUrl: string | null }[] }[] };
type VotesResponse = { data: { id: number; upVotes: number; downVotes: number }[] };

function settled<T>(result: PromiseSettledResult<T>): T | null {
  if (result.status === "fulfilled") return result.value;
  console.warn("[roblox]", result.reason instanceof Error ? result.reason.message : result.reason);
  return null;
}

/** Fetch public details, icons, thumbnails and votes for up to 50 universes in one batch. */
export async function getRobloxGames(universeIds: string[]): Promise<Record<string, RobloxGame>> {
  "use cache";
  cacheTag(CACHE_TAGS.roblox);

  const ids = [...new Set(universeIds.filter((id) => isId(id)))].sort().slice(0, 50);
  if (ids.length === 0) {
    cacheLife("hours");
    return {};
  }
  const list = ids.join(",");
  const [games, icons, thumbs, votes] = await Promise.allSettled([
    fetchJson<GamesResponse>(`https://games.roblox.com/v1/games?universeIds=${list}`),
    fetchJson<ThumbResponse>(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${list}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`,
    ),
    fetchJson<MultiThumbResponse>(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${list}&countPerUniverse=10&defaults=true&size=768x432&format=Png&isCircular=false`,
    ),
    fetchJson<VotesResponse>(`https://games.roblox.com/v1/games/votes?universeIds=${list}`),
  ]);

  const gameData = settled(games);
  if (!gameData) {
    cacheLife(FAILURE_LIFE);
    return {};
  }
  cacheLife("minutes");

  const iconMap = new Map((settled(icons)?.data ?? []).map((i) => [String(i.targetId), i]));
  const thumbMap = new Map((settled(thumbs)?.data ?? []).map((t) => [String(t.universeId), t.thumbnails]));
  const voteMap = new Map((settled(votes)?.data ?? []).map((v) => [String(v.id), v]));

  const result: Record<string, RobloxGame> = {};
  for (const g of gameData.data) {
    const id = String(g.id);
    const icon = iconMap.get(id);
    const vote = voteMap.get(id);
    result[id] = {
      universeId: id,
      placeId: String(g.rootPlaceId),
      name: g.name,
      description: g.description ?? "",
      creatorName: g.creator?.name ?? "",
      genre: g.genre ?? "",
      playing: g.playing ?? null,
      visits: g.visits ?? null,
      favorites: g.favoritedCount ?? null,
      maxPlayers: g.maxPlayers ?? null,
      upVotes: vote?.upVotes ?? null,
      downVotes: vote?.downVotes ?? null,
      created: g.created ?? null,
      updated: g.updated ?? null,
      iconUrl: icon?.state === "Completed" && icon.imageUrl ? icon.imageUrl : null,
      thumbnails: (thumbMap.get(id) ?? [])
        .filter((t) => t.state === "Completed" && t.imageUrl)
        .map((t) => t.imageUrl as string),
    };
  }
  return result;
}

export type RobloxGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number | null;
  ownerName: string | null;
  verified: boolean;
  iconUrl: string | null;
};

export async function getRobloxGroup(groupId: string): Promise<RobloxGroup | null> {
  "use cache";
  cacheTag(CACHE_TAGS.roblox);
  if (!isId(groupId)) {
    cacheLife("hours");
    return null;
  }

  const [info, icon] = await Promise.allSettled([
    fetchJson<{
      id: number;
      name: string;
      description: string;
      memberCount?: number;
      hasVerifiedBadge?: boolean;
      owner?: { username?: string; displayName?: string } | null;
    }>(`https://groups.roblox.com/v1/groups/${groupId}`),
    fetchJson<ThumbResponse>(
      `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=420x420&format=Png&isCircular=false`,
    ),
  ]);
  const group = settled(info);
  if (!group) {
    cacheLife(FAILURE_LIFE);
    return null;
  }
  cacheLife("minutes");
  const iconData = settled(icon)?.data?.[0];
  return {
    id: String(group.id),
    name: group.name,
    description: group.description ?? "",
    memberCount: typeof group.memberCount === "number" ? group.memberCount : null,
    ownerName: group.owner?.displayName || group.owner?.username || null,
    verified: !!group.hasVerifiedBadge,
    iconUrl: iconData?.state === "Completed" ? iconData.imageUrl : null,
  };
}

export type RobloxGroupGame = { universeId: string; placeId: string; name: string; description: string };

/** Public games owned by a group. Used by the admin "import from group" tool (uncached). */
export async function listGroupGames(groupId: string): Promise<RobloxGroupGame[]> {
  if (!isId(groupId)) throw new RobloxError("Invalid group ID");
  type Res = { data: { id: number; name: string; description: string | null; rootPlace?: { id: number } }[] };
  let res: Res;
  try {
    res = await fetchJson<Res>(`https://games.roblox.com/v2/groups/${groupId}/gamesV2?accessFilter=2&limit=50&sortOrder=Desc`);
  } catch {
    res = await fetchJson<Res>(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=Public&limit=50&sortOrder=Desc`);
  }
  return res.data
    .filter((g) => g.rootPlace?.id)
    .map((g) => ({
      universeId: String(g.id),
      placeId: String(g.rootPlace!.id),
      name: g.name,
      description: g.description ?? "",
    }));
}

/** Resolve a place ID to its universe ID (uncached; used when an admin adds a game). */
export async function resolveUniverseId(placeId: string): Promise<string> {
  if (!isId(placeId)) throw new RobloxError("Invalid place ID");
  const res = await fetchJson<{ universeId: number | null }>(
    `https://apis.roblox.com/universes/v1/places/${placeId}/universe`,
  );
  if (!res.universeId) throw new RobloxError("That place doesn't belong to a public experience");
  return String(res.universeId);
}

/** Cached place → universe lookup used when a game was saved without a universe ID. */
export async function getUniverseIdForPlace(placeId: string): Promise<string | null> {
  "use cache";
  cacheTag(CACHE_TAGS.roblox);
  try {
    const id = await resolveUniverseId(placeId);
    cacheLife("max");
    return id;
  } catch {
    cacheLife(FAILURE_LIFE);
    return null;
  }
}

/** Uncached single-game lookup for the admin import flow. */
export async function fetchRobloxGameNow(universeId: string) {
  const res = await fetchJson<GamesResponse>(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
  return res.data[0] ?? null;
}

/** Accepts a Roblox game URL (roblox.com/games/123/...) or a bare place ID. */
export function parsePlaceId(input: string): string | null {
  const trimmed = input.trim();
  if (isId(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (!/(^|\.)roblox\.com$/.test(url.hostname)) return null;
    const match = url.pathname.match(/\/games\/(\d+)/);
    if (match) return match[1];
    const placeId = url.searchParams.get("placeId");
    return placeId && isId(placeId) ? placeId : null;
  } catch {
    return null;
  }
}

/** Accepts a Roblox group/community URL or a bare group ID. */
export function parseGroupId(input: string): string | null {
  const trimmed = input.trim();
  if (isId(trimmed)) return trimmed;
  const match = trimmed.match(/roblox\.com\/(?:groups|communities)\/(\d+)/);
  return match ? match[1] : null;
}

export function robloxPlayUrl(placeId: string | null | undefined) {
  return isId(placeId) ? `https://www.roblox.com/games/${placeId}` : null;
}

export function robloxGroupUrl(groupId: string) {
  return isId(groupId) ? `https://www.roblox.com/communities/${groupId}` : null;
}

"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { gameUpdates, games } from "@/db/schema";
import {
  bool,
  failure,
  fromZodError,
  handleActionError,
  imageRef,
  list,
  optionalDate,
  optionalImageRef,
  slugSchema,
  str,
  success,
  type ActionState,
} from "@/lib/admin/forms";
import { assertAdmin } from "@/lib/auth/session";
import { GAME_STATUSES, PLATFORMS } from "@/lib/constants";
import { refresh } from "@/lib/revalidate";
import { fetchRobloxGameNow, parsePlaceId, resolveUniverseId } from "@/lib/roblox";
import { slugify } from "@/lib/utils";

const gameSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  slug: slugSchema,
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(20000),
  placeInput: z.string().trim().max(300),
  status: z.enum(GAME_STATUSES),
  platforms: z.array(z.enum(PLATFORMS)),
  genre: z.string().trim().max(40),
  featured: z.boolean(),
  published: z.boolean(),
  showStats: z.boolean(),
  sortOrder: z.coerce.number().int().min(-9999).max(9999),
  iconUrl: optionalImageRef,
  thumbnailUrl: optionalImageRef,
  screenshots: z.array(imageRef).max(20, "Up to 20 screenshots"),
  releaseDate: optionalDate,
});

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "game";
  for (let i = 2; ; i++) {
    const [clash] = await db
      .select({ id: games.id })
      .from(games)
      .where(excludeId ? and(eq(games.slug, slug), ne(games.id, excludeId)) : eq(games.slug, slug))
      .limit(1);
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
}

export async function saveGame(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  try {
    await assertAdmin();
    const id = str(formData, "id") || undefined;
    const parsed = gameSchema.safeParse({
      name: str(formData, "name"),
      slug: str(formData, "slug") || slugify(str(formData, "name")),
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      placeInput: str(formData, "placeId"),
      status: str(formData, "status"),
      platforms: formData.getAll("platforms"),
      genre: str(formData, "genre"),
      featured: bool(formData, "featured"),
      published: bool(formData, "published"),
      showStats: bool(formData, "showStats"),
      sortOrder: str(formData, "sortOrder") || "0",
      iconUrl: str(formData, "iconUrl"),
      thumbnailUrl: str(formData, "thumbnailUrl"),
      screenshots: list(formData, "screenshots"),
      releaseDate: str(formData, "releaseDate"),
    });
    if (!parsed.success) return fromZodError(parsed.error);
    const { placeInput, ...data } = parsed.data;

    let placeId: string | null = null;
    if (placeInput) {
      placeId = parsePlaceId(placeInput);
      if (!placeId) return failure("That doesn't look like a Roblox game link or place ID.", { placeId: "Paste a roblox.com/games/… link or a numeric place ID" });
    }

    const existing = id ? await db.query.games.findFirst({ where: eq(games.id, id) }) : null;
    if (id && !existing) return failure("This game no longer exists.");

    let universeId = existing?.placeId === placeId ? existing?.universeId ?? null : null;
    let notice = "";
    if (placeId && !universeId) {
      try {
        universeId = await resolveUniverseId(placeId);
      } catch {
        notice = " Roblox couldn't be reached to verify the place ID; live data will load once it can.";
      }
    }

    const values = { ...data, placeId, universeId, slug: await uniqueSlug(data.slug, id) };
    if (existing) {
      await db.update(games).set(values).where(eq(games.id, existing.id));
    } else {
      const [row] = await db.insert(games).values(values).returning({ id: games.id });
      createdId = row.id;
    }
    refresh("games", "roblox");
    if (!createdId) return success(`Game saved.${notice}`, { slug: values.slug });
  } catch (err) {
    return handleActionError(err);
  }
  redirect(`/admin/games/${createdId}?created=1`);
}

/** Create a game straight from a Roblox link, pre-filled with its public name and details. */
export async function importGame(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  try {
    await assertAdmin();
    const placeId = parsePlaceId(str(formData, "url"));
    if (!placeId) return failure("Paste a Roblox game link (roblox.com/games/…) or a place ID.", { url: "Invalid link" });

    const [duplicate] = await db.select({ id: games.id }).from(games).where(eq(games.placeId, placeId)).limit(1);
    if (duplicate) return failure("That game has already been added.", { url: "Already added" });

    let universeId: string;
    let info: Awaited<ReturnType<typeof fetchRobloxGameNow>>;
    try {
      universeId = await resolveUniverseId(placeId);
      info = await fetchRobloxGameNow(universeId);
    } catch (err) {
      return failure(`Couldn't load that game from Roblox: ${err instanceof Error ? err.message : "unknown error"}`, { url: "Roblox lookup failed" });
    }
    if (!info) return failure("Roblox didn't return details for that game.", { url: "Not found" });

    const [row] = await db
      .insert(games)
      .values({
        name: info.name.slice(0, 80),
        slug: await uniqueSlug(slugify(info.name)),
        placeId,
        universeId,
        status: "released",
        platforms: ["pc", "mobile", "tablet"],
        genre: info.genre && info.genre !== "All" ? info.genre : "",
        // Left empty so the live Roblox description is shown until you write your own.
        description: "",
        published: bool(formData, "publish"),
      })
      .returning({ id: games.id });
    createdId = row.id;
    refresh("games", "roblox");
  } catch (err) {
    return handleActionError(err);
  }
  redirect(`/admin/games/${createdId}?created=1`);
}

export async function deleteGame(id: string): Promise<ActionState> {
  try {
    await assertAdmin();
    await db.delete(games).where(eq(games.id, id));
    refresh("games", "posts");
    return success("Game deleted.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function setGameFlag(id: string, flag: "featured" | "published", value: boolean): Promise<ActionState> {
  try {
    await assertAdmin();
    if ((flag !== "featured" && flag !== "published") || typeof value !== "boolean") return failure("Invalid change.");
    await db.update(games).set({ [flag]: value }).where(eq(games.id, id));
    refresh("games");
    return success(flag === "featured" ? (value ? "Marked as featured." : "Removed from featured.") : value ? "Game is now public." : "Game hidden from the site.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function setGameStatus(id: string, status: string): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = z.enum(GAME_STATUSES).safeParse(status);
    if (!parsed.success) return failure("Invalid status.");
    await db.update(games).set({ status: parsed.data }).where(eq(games.id, id));
    refresh("games");
    return success("Status updated.");
  } catch (err) {
    return handleActionError(err);
  }
}

const updateSchema = z.object({
  gameId: z.uuid(),
  version: z.string().trim().max(30),
  title: z.string().trim().min(1, "Required").max(120),
  body: z.string().trim().max(10000),
  publishedAt: optionalDate,
});

export async function saveGameUpdate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const parsed = updateSchema.safeParse({
      gameId: str(formData, "gameId"),
      version: str(formData, "version"),
      title: str(formData, "title"),
      body: str(formData, "body"),
      publishedAt: str(formData, "publishedAt"),
    });
    if (!parsed.success) return fromZodError(parsed.error);
    const { publishedAt, ...rest } = parsed.data;
    const id = str(formData, "id");
    if (id) {
      await db
        .update(gameUpdates)
        .set({ ...rest, ...(publishedAt ? { publishedAt } : {}) })
        .where(and(eq(gameUpdates.id, id), eq(gameUpdates.gameId, rest.gameId)));
    } else {
      await db.insert(gameUpdates).values({ ...rest, publishedAt: publishedAt ?? new Date() });
    }
    refresh("games");
    return success(id ? "Update log entry saved." : "Update log entry added.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function deleteGameUpdate(id: string): Promise<ActionState> {
  try {
    await assertAdmin();
    await db.delete(gameUpdates).where(eq(gameUpdates.id, id));
    refresh("games");
    return success("Update log entry deleted.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function refreshRobloxData(): Promise<ActionState> {
  try {
    await assertAdmin();
    refresh("roblox", "discord");
    return success("Roblox and Discord data will be fetched fresh on the next page view.");
  } catch (err) {
    return handleActionError(err);
  }
}

"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { games, media, posts, projects, settings } from "@/db/schema";
import { failure, handleActionError, success, type ActionState } from "@/lib/admin/forms";
import { assertAdmin } from "@/lib/auth/session";
import { MAX_UPLOAD_BYTES, imageSize, mediaUrl, sniffImage } from "@/lib/media";

export async function uploadMedia(formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return failure("Choose an image to upload.");
    if (file.size > MAX_UPLOAD_BYTES) return failure(`Images must be ${MAX_UPLOAD_BYTES / 1024 / 1024} MB or smaller.`);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = sniffImage(bytes);
    if (!type) return failure("Only PNG, JPEG, WebP, GIF and AVIF images are supported.");
    const dims = imageSize(bytes, type.mime);

    const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").slice(0, 60) || "image";
    const [row] = await db
      .insert(media)
      .values({
        filename: `${base}.${type.ext}`,
        mimeType: type.mime,
        size: bytes.length,
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        data: Buffer.from(bytes),
        uploadedBy: admin.id,
      })
      .returning({ id: media.id });
    return success("Image uploaded.", { url: mediaUrl(row.id), id: row.id });
  } catch (err) {
    return handleActionError(err);
  }
}

/** Refuse to delete images that are still used somewhere, so nothing on the site breaks. */
export async function deleteMedia(id: string): Promise<ActionState> {
  try {
    await assertAdmin();
    const url = mediaUrl(id);
    const like = `%${url}%`;
    const [usage] = await db.execute<{ n: number }>(sql`
      select (
        (select count(*) from ${games} where ${games.iconUrl} = ${url} or ${games.thumbnailUrl} = ${url} or ${url} = any(${games.screenshots}) or ${games.description} like ${like}) +
        (select count(*) from ${projects} where ${projects.coverUrl} = ${url} or ${url} = any(${projects.gallery}) or ${projects.description} like ${like}) +
        (select count(*) from ${posts} where ${posts.coverUrl} = ${url} or ${posts.body} like ${like}) +
        (select count(*) from ${settings} where ${settings.value}::text like ${like})
      )::int as n
    `);
    if (usage && usage.n > 0) return failure(`This image is still used in ${usage.n} place${usage.n === 1 ? "" : "s"}. Remove it there first.`);
    await db.delete(media).where(eq(media.id, id));
    return success("Image deleted.");
  } catch (err) {
    return handleActionError(err);
  }
}

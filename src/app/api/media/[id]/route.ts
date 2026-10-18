import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function GET(_req: Request, ctx: RouteContext<"/api/media/[id]">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });

  try {
    const [file] = await db
      .select({ data: media.data, mimeType: media.mimeType, filename: media.filename })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);
    if (!file) return new Response("Not found", { status: 404 });

    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.data.length),
        // Media rows are immutable: a new upload always gets a new ID.
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        "Content-Disposition": `inline; filename="${file.filename.replace(/[^\w.-]/g, "_")}"`,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        "Cross-Origin-Resource-Policy": "same-site",
      },
    });
  } catch (err) {
    console.error("[media]", err);
    return new Response("Unable to load media", { status: 500 });
  }
}

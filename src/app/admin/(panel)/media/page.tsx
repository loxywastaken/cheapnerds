import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { MediaGrid, MediaUploader } from "@/components/admin/media-library";
import { AdminPageTitle } from "@/components/admin/page-title";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  await requireAdmin();
  const items = await db
    .select({ id: media.id, filename: media.filename, size: media.size, width: media.width, height: media.height, createdAt: media.createdAt })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(300);
  return (
    <>
      <AdminPageTitle
        title="Media library"
        description="Every uploaded image. Copy a URL to use it in Markdown, e.g. ![Alt text](/api/media/…). Images in use can't be deleted."
      />
      <MediaUploader />
      <div className="mt-8">{items.length === 0 ? <p className="text-sm text-subtle">No uploads yet.</p> : <MediaGrid items={items} />}</div>
    </>
  );
}

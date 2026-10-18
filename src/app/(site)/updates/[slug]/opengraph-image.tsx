import { POST_CATEGORY_LABELS } from "@/lib/constants";
import { getPost, getSettings } from "@/lib/data";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Cheap Nerds update";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!post) return renderOgImage({ eyebrow: "Update", title: settings.siteName, siteName: settings.siteName });
  return renderOgImage({
    eyebrow: POST_CATEGORY_LABELS[post.category],
    title: post.title,
    subtitle: post.excerpt,
    image: post.coverUrl,
    siteName: settings.siteName,
  });
}

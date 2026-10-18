import { getPosts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

const escape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const [posts, settings] = await Promise.all([getPosts({ limit: 30 }), getSettings()]);
  const items = posts
    .map(
      (p) => `<item><title>${escape(p.title)}</title><link>${siteUrl(`/updates/${p.slug}`)}</link><guid>${siteUrl(`/updates/${p.slug}`)}</guid><pubDate>${p.publishedAt.toUTCString()}</pubDate><description>${escape(p.excerpt)}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escape(settings.siteName)} Updates</title><link>${siteUrl("/updates")}</link><description>${escape(settings.siteDescription)}</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

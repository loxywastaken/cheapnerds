import type { MetadataRoute } from "next";
import { getGames, getPosts, getProjects } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, posts, projects] = await Promise.all([getGames(), getPosts(), getProjects()]);
  const staticPages = ["", "/games", "/work", "/updates", "/community"].map((path) => ({
    url: siteUrl(path || "/"),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...games.map((g) => ({ url: siteUrl(`/games/${g.slug}`), lastModified: g.lastUpdated ?? undefined, priority: 0.9 })),
    ...projects.map((p) => ({ url: siteUrl(`/work/${p.slug}`), lastModified: p.updatedAt, priority: 0.6 })),
    ...posts.map((p) => ({ url: siteUrl(`/updates/${p.slug}`), lastModified: p.publishedAt, priority: 0.7 })),
  ];
}

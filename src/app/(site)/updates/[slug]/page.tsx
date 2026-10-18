import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { PostCard } from "@/components/site/post-card";
import { CoverImage } from "@/components/ui/cover-image";
import { ArticleSkeleton } from "@/components/ui/detail-skeleton";
import { Markdown } from "@/components/ui/markdown";
import { POST_CATEGORY_LABELS } from "@/lib/constants";
import { getGames, getPost, getPosts, getRelatedPosts, getSettings } from "@/lib/data";
import { formatDate, plainText, siteUrl, toIsoDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPosts({ limit: 50 });
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/updates/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  const description = post.excerpt || plainText(post.body, 160);
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: "article", publishedTime: toIsoDate(post.publishedAt) },
    alternates: { canonical: `/updates/${post.slug}` },
  };
}

export default function PostPage({ params }: PageProps<"/updates/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <PostDetail params={params} />
    </Suspense>
  );
}

async function PostDetail({ params }: Pick<PageProps<"/updates/[slug]">, "params">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [related, games, settings] = await Promise.all([getRelatedPosts(post.slug), post.gameId ? getGames() : Promise.resolve([]), getSettings()]);
  const game = games.find((g) => g.id === post.gameId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    datePublished: toIsoDate(post.publishedAt),
    dateModified: toIsoDate(post.updatedAt),
    image: post.coverUrl ? [post.coverUrl.startsWith("/") ? siteUrl(post.coverUrl) : post.coverUrl] : undefined,
    publisher: { "@type": "Organization", name: settings.siteName },
  };

  return (
    <>
      <article className="container-page max-w-4xl pt-28 sm:pt-36">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <Link href="/updates" className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-strong/80 transition-colors hover:text-strong">
          <ArrowLeft className="size-4" aria-hidden="true" /> All updates
        </Link>
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand-soft">{POST_CATEGORY_LABELS[post.category]}</span>
            <time dateTime={toIsoDate(post.publishedAt)} className="text-subtle">
              {formatDate(post.publishedAt)}
            </time>
          </div>
          <h1 className="text-outline-white mt-5 text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted sm:text-xl">{post.excerpt}</p>}
          {game && (
            <Link
              href={`/games/${game.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-tint/[0.03] px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-line-strong"
            >
              <Gamepad2 className="size-4 text-brand-soft" aria-hidden="true" /> {game.name}
            </Link>
          )}
        </header>
        {post.coverUrl && (
          <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl border-[3px] border-outline bg-surface-2 shadow-[0_6px_0_var(--color-outline)]">
            <CoverImage src={post.coverUrl} alt="" sizes="(min-width: 1024px) 896px, 100vw" preload zoom={false} />
          </div>
        )}
        <Markdown className="mt-10">{post.body}</Markdown>
      </article>

      {related.length > 0 && (
        <section className="container-page mt-24" aria-labelledby="more-posts">
          <h2 id="more-posts" className="mb-6 text-2xl font-semibold text-strong">
            More updates
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

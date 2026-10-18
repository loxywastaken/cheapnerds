import Link from "next/link";
import { Newspaper, Pin } from "lucide-react";
import { CoverImage } from "@/components/ui/cover-image";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { POST_CATEGORY_LABELS, type PostCategory } from "@/lib/constants";
import { cn, formatDate, toIsoDate } from "@/lib/utils";

type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  category: PostCategory;
  publishedAt: Date;
  pinned?: boolean;
};

export function PostCard({ post, variant = "default" }: { post: PostCardData; variant?: "default" | "large" }) {
  const large = variant === "large";
  return (
    <SpotlightCard className={cn("group flex h-full overflow-hidden", large ? "flex-col lg:flex-row" : "flex-col")}>
      <div className={cn("relative overflow-hidden border-outline bg-surface-2", large ? "aspect-video border-b-[3px] lg:aspect-auto lg:min-h-[22rem] lg:w-3/5 lg:border-b-0 lg:border-r-[3px]" : "aspect-[16/9] border-b-[3px]")}>
        <CoverImage src={post.coverUrl} alt="" sizes={large ? "(min-width: 1024px) 700px, 100vw" : "(min-width: 1024px) 400px, 100vw"} fallbackIcon={Newspaper} />
      </div>
      <div className={cn("flex flex-1 flex-col p-5", large && "lg:p-8")}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip-solid rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 font-medium text-brand-soft">
            {POST_CATEGORY_LABELS[post.category]}
          </span>
          {post.pinned && (
            <span className="inline-flex items-center gap-1 text-brand">
              <Pin className="size-3" aria-hidden="true" /> Pinned
            </span>
          )}
          <time dateTime={toIsoDate(post.publishedAt)} className="text-subtle">
            {formatDate(post.publishedAt)}
          </time>
        </div>
        <h3 className={cn("mt-3 font-semibold text-strong", large ? "text-2xl lg:text-3xl" : "text-lg")}>
          <Link href={`/updates/${post.slug}`} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className={cn("mt-2 text-sm leading-relaxed text-muted", large ? "line-clamp-4 lg:text-base" : "line-clamp-3")}>{post.excerpt}</p>}
        <span className="mt-auto pt-5 font-display text-sm font-semibold text-brand transition-colors group-hover:text-strong">Read more →</span>
      </div>
    </SpotlightCard>
  );
}

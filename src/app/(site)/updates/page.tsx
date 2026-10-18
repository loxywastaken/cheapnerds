import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { FilterableGrid } from "@/components/site/filterable-grid";
import { PostCard } from "@/components/site/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader } from "@/components/ui/section-heading";
import { POST_CATEGORIES, POST_CATEGORY_LABELS } from "@/lib/constants";
import { getPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "News & Updates",
  description: "New releases, Roblox game updates, development progress, events and sneak peeks from Cheap Nerds.",
  alternates: { types: { "application/rss+xml": "/updates/rss.xml" } },
};

export default async function UpdatesPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHeader eyebrow="News & updates" title="What's new" description="Releases, patch notes, dev progress, events and sneak peeks — straight from the team." />
      <div className="container-page space-y-14 pt-14">
        {!lead ? (
          <EmptyState icon={Newspaper} title="No posts yet">
            Our first announcements are coming soon.
          </EmptyState>
        ) : (
          <>
            <Reveal>
              <PostCard post={lead} variant="large" />
            </Reveal>
            {rest.length > 0 && (
              <FilterableGrid
                searchPlaceholder="Search posts…"
                emptyLabel="No posts match that search."
                filters={POST_CATEGORIES.map((c) => ({ value: c, label: POST_CATEGORY_LABELS[c] }))}
                items={rest.map((post) => ({
                  id: post.id,
                  filter: post.category,
                  searchText: `${post.title} ${post.excerpt}`,
                  node: <PostCard post={post} />,
                }))}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionButton, ActionSwitch } from "@/components/admin/action-button";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { POST_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { deletePost, setPostFlag } from "../../actions/content";

export const metadata: Metadata = { title: "News" };

export default async function AdminPostsPage() {
  await requireAdmin();
  const rows = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug, category: posts.category, pinned: posts.pinned, published: posts.published, publishedAt: posts.publishedAt })
    .from(posts)
    .orderBy(desc(posts.pinned), desc(posts.publishedAt));
  return (
    <>
      <AdminPageTitle
        title="News & updates"
        description="Announcements, patch notes, dev logs, events and sneak peeks."
        actions={
          <Link href="/admin/posts/new" className={buttonClass("accent", "sm")}>
            <Plus className="size-4" aria-hidden="true" /> New post
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={Newspaper} title="No posts yet">
          <Link href="/admin/posts/new" className="text-brand-soft hover:text-white">
            Write your first post →
          </Link>
        </EmptyState>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="border-b border-line text-left text-xs text-subtle">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 text-center font-medium">Pinned</th>
                  <th className="px-3 py-3 text-center font-medium">Published</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02]">
                    <td className="max-w-xs px-5 py-3">
                      <Link href={`/admin/posts/${post.id}`} className="block truncate font-medium text-white hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted">{POST_CATEGORY_LABELS[post.category]}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDate(post.publishedAt)}</td>
                    <td className="px-3 py-3 text-center">
                      <ActionSwitch checked={post.pinned} onChange={setPostFlag.bind(null, post.id, "pinned")} label={`Pinned: ${post.title}`} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ActionSwitch checked={post.published} onChange={setPostFlag.bind(null, post.id, "published")} label={`Published: ${post.title}`} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/posts/${post.id}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/10 hover:text-white" aria-label={`Edit ${post.title}`}>
                          <Pencil className="size-4" />
                        </Link>
                        <ActionButton
                          action={deletePost.bind(null, post.id)}
                          confirm={`Delete “${post.title}”? This can't be undone.`}
                          title={`Delete ${post.title}`}
                          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
                        >
                          <Trash2 className="size-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

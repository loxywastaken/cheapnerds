import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { PostForm } from "@/components/admin/post-form";
import { db } from "@/db";
import { games, posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [post, gameList] = await Promise.all([
    db.query.posts.findFirst({ where: eq(posts.id, id) }),
    db.select({ id: games.id, name: games.name }).from(games).orderBy(asc(games.name)),
  ]);
  if (!post) notFound();
  return (
    <>
      <Link href="/admin/posts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" /> News
      </Link>
      <AdminPageTitle title={post.title} description={post.published ? "Published" : "Draft"} />
      <PostForm post={post} games={gameList} />
    </>
  );
}

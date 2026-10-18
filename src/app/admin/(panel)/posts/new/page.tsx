import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { PostForm } from "@/components/admin/post-form";
import { db } from "@/db";
import { games } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireAdmin();
  const gameList = await db.select({ id: games.id, name: games.name }).from(games).orderBy(asc(games.name));
  return (
    <>
      <Link href="/admin/posts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" /> News
      </Link>
      <AdminPageTitle title="New post" />
      <PostForm games={gameList} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { GameForm } from "@/components/admin/game-form";
import { GameUpdatesManager } from "@/components/admin/game-updates";
import { AdminPageTitle } from "@/components/admin/page-title";
import { db } from "@/db";
import { gameUpdates, games } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit game" };

const UUID = /^[0-9a-f-]{36}$/;

export default async function EditGamePage({ params }: PageProps<"/admin/games/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const game = await db.query.games.findFirst({ where: eq(games.id, id) });
  if (!game) notFound();
  const updates = await db.select().from(gameUpdates).where(eq(gameUpdates.gameId, id)).orderBy(desc(gameUpdates.publishedAt));

  return (
    <>
      <Link href="/admin/games" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" /> Games
      </Link>
      <AdminPageTitle title={game.name} description={game.published ? "Published" : "Draft — hidden from the public site"} />
      <GameForm game={game} />
      <div className="mt-6">
        <GameUpdatesManager gameId={game.id} updates={updates} />
      </div>
    </>
  );
}

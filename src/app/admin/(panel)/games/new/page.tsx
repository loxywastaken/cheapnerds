import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { GameForm } from "@/components/admin/game-form";
import { ImportGameForm } from "@/components/admin/import-game-form";
import { AdminPageTitle } from "@/components/admin/page-title";
import { db } from "@/db";
import { games } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data";
import { listGroupGames } from "@/lib/roblox";

export const metadata: Metadata = { title: "Add game" };

export default async function NewGamePage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/games" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" /> Games
      </Link>
      <AdminPageTitle title="Add a game" description="The quickest way: paste a Roblox link and we'll pull in the name, icon, thumbnails and stats." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <h2 className="mb-1 font-semibold text-white">Import from Roblox</h2>
          <p className="mb-5 text-sm text-muted">Works with any public Roblox experience.</p>
          <ImportGameForm />
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="mb-1 font-semibold text-white">From the Cheap Nerds group</h2>
          <p className="mb-5 text-sm text-muted">Public games owned by your Roblox group that aren&apos;t on the site yet.</p>
          <Suspense fallback={<div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}</div>}>
            <GroupGames />
          </Suspense>
        </section>
      </div>
      <div className="my-10 flex items-center gap-4 text-xs uppercase tracking-widest text-subtle">
        <span className="h-px flex-1 bg-line" /> or create one manually <span className="h-px flex-1 bg-line" />
      </div>
      <GameForm />
    </>
  );
}

async function GroupGames() {
  const settings = await getSettings();
  if (!settings.roblox.groupId) return <p className="text-sm text-subtle">Set your Roblox group ID in Site settings first.</p>;
  let list: Awaited<ReturnType<typeof listGroupGames>>;
  try {
    list = await listGroupGames(settings.roblox.groupId);
  } catch {
    return <p className="text-sm text-warn">Couldn&apos;t reach Roblox right now. Try again in a moment, or import by link.</p>;
  }
  const existing = new Set((await db.select({ placeId: games.placeId }).from(games)).map((g) => g.placeId));
  const available = list.filter((g) => !existing.has(g.placeId));
  if (available.length === 0) return <p className="text-sm text-subtle">All of the group&apos;s public games are already on the site. 🎉</p>;
  return (
    <ul className="divide-y divide-line">
      {available.map((g) => (
        <li key={g.universeId} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{g.name}</p>
            <p className="text-xs text-subtle">Place {g.placeId}</p>
          </div>
          <ImportGameForm defaultUrl={g.placeId} compact />
        </li>
      ))}
    </ul>
  );
}

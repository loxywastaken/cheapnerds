import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { Gamepad2, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionButton, ActionSelect, ActionSwitch } from "@/components/admin/action-button";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/db";
import { games } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { getRobloxGames } from "@/lib/roblox";
import { GAME_STATUSES, GAME_STATUS_LABELS } from "@/lib/constants";
import { deleteGame, setGameFlag, setGameStatus } from "../../actions/games";

export const metadata: Metadata = { title: "Games" };

export default async function AdminGamesPage() {
  await requireAdmin();
  const rows = await db.select().from(games).orderBy(desc(games.featured), asc(games.sortOrder), asc(games.name));
  const roblox = await getRobloxGames(rows.map((g) => g.universeId ?? "").filter(Boolean));

  return (
    <>
      <AdminPageTitle
        title="Games"
        description="Add, edit and feature your Roblox games. Icons, thumbnails and stats load live from Roblox."
        actions={
          <Link href="/admin/games/new" className={buttonClass("accent", "sm")}>
            <Plus className="size-4" aria-hidden="true" /> Add game
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={Gamepad2} title="No games yet">
          <Link href="/admin/games/new" className="text-violet-soft hover:text-white">
            Add your first game from a Roblox link →
          </Link>
        </EmptyState>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-line text-left text-xs text-subtle">
                <tr>
                  <th className="px-5 py-3 font-medium">Game</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-center font-medium">Featured</th>
                  <th className="px-3 py-3 text-center font-medium">Published</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((game) => {
                  const live = game.universeId ? roblox[game.universeId] : undefined;
                  const icon = game.iconUrl || live?.iconUrl;
                  return (
                    <tr key={game.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-surface-3">
                            {icon && <Image src={icon} alt="" fill sizes="44px" className="object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/games/${game.id}`} className="font-medium text-white hover:underline">
                              {game.name}
                            </Link>
                            <p className="truncate text-xs text-subtle">
                              {game.placeId ? `Place ${game.placeId}` : "No Roblox place linked"}
                              {game.placeId && !live && " · live data unavailable"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <ActionSelect
                          value={game.status}
                          label={`Status of ${game.name}`}
                          options={GAME_STATUSES.map((s) => ({ value: s, label: GAME_STATUS_LABELS[s] }))}
                          onChange={setGameStatus.bind(null, game.id)}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ActionSwitch checked={game.featured} onChange={setGameFlag.bind(null, game.id, "featured")} label={`Featured: ${game.name}`} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ActionSwitch checked={game.published} onChange={setGameFlag.bind(null, game.id, "published")} label={`Published: ${game.name}`} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/games/${game.id}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/10 hover:text-white" aria-label={`Edit ${game.name}`}>
                            <Pencil className="size-4" />
                          </Link>
                          <ActionButton
                            action={deleteGame.bind(null, game.id)}
                            confirm={`Delete “${game.name}”? Its update log will be deleted too. This can't be undone.`}
                            title={`Delete ${game.name}`}
                            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
                          >
                            <Trash2 className="size-4" />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

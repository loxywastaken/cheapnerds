import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { AdminPageTitle } from "@/components/admin/page-title";
import { SettingsForm } from "@/components/admin/settings-form";
import { db } from "@/db";
import { games, settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { parseSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const [row, gameList] = await Promise.all([
    db.query.settings.findFirst({ where: eq(settings.key, "site") }),
    db.select({ id: games.id, name: games.name }).from(games).orderBy(asc(games.name)),
  ]);
  const current = parseSettings(row?.value);
  return (
    <>
      <AdminPageTitle title="Site settings" description="Homepage content, community links, branding and more. Changes go live as soon as you save." />
      <SettingsForm initial={current} games={gameList} />
    </>
  );
}

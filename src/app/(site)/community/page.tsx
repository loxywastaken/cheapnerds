import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { DiscordCard, GroupCard } from "@/components/site/community";
import { GameCard } from "@/components/site/game-card";
import { PostCard } from "@/components/site/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader, SectionHeading, TextLink } from "@/components/ui/section-heading";
import { getGames, getPosts, getSettings } from "@/lib/data";
import { getDiscordServer } from "@/lib/discord";
import { getRobloxGroup } from "@/lib/roblox";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the Cheap Nerds Roblox group and Discord server for playtests, events and sneak peeks.",
};

export default async function CommunityPage() {
  const settings = await getSettings();
  const [group, discord, games, community, events] = await Promise.all([
    getRobloxGroup(settings.roblox.groupId),
    getDiscordServer(settings.discord.inviteUrl),
    getGames(),
    getPosts({ category: "community", limit: 3 }),
    getPosts({ category: "event", limit: 3 }),
  ]);
  const announcements = [...community, ...events].sort((a, b) => +b.publishedAt - +a.publishedAt).slice(0, 3);
  const groupGames = games.filter((g) => g.status === "released").slice(0, 3);

  return (
    <>
      <PageHeader title="Community" description="The group gets you perks in our games. The Discord is where we actually hang out." />
      <div className="container-page space-y-24 pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <GroupCard settings={settings} group={group} className="h-full" />
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <DiscordCard settings={settings} server={discord} className="h-full" />
          </Reveal>
        </div>

        {groupGames.length > 0 && (
          <section aria-labelledby="group-games">
            <SectionHeading title={<span id="group-games">Games from the group</span>} action={<TextLink href="/games">All games</TextLink>} />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groupGames.map((game, i) => (
                <Reveal as="li" key={game.id} delay={i * 0.06}>
                  <GameCard game={game} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="announcements">
          <SectionHeading title={<span id="announcements">Announcements</span>} action={<TextLink href="/updates?filter=community">All news</TextLink>} />
          <div className="mt-8">
            {announcements.length > 0 ? (
              <ul className="grid gap-6 md:grid-cols-3">
                {announcements.map((post, i) => (
                  <Reveal as="li" key={post.id} delay={i * 0.06}>
                    <PostCard post={post} />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Megaphone} title="Nothing yet">
                Events and community news will show up here.
              </EmptyState>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

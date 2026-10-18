import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { DiscordPromo, GroupPromo } from "@/components/site/community";
import { GameCard } from "@/components/site/game-card";
import { PostCard } from "@/components/site/post-card";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader, SectionHeading } from "@/components/ui/section-heading";
import { getGames, getPosts, getSettings } from "@/lib/data";
import { getDiscordServer } from "@/lib/discord";
import { getRobloxGroup } from "@/lib/roblox";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the Cheap Nerds Roblox group and Discord server — early access, events, sneak peeks and a friendly community.",
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
      <PageHeader
        eyebrow="Community"
        title="Come build with us"
        description="Our Roblox group and Discord server are where players, testers and the team meet. Pick your favourite — or join both."
      />
      <div className="container-page space-y-28 pt-14">
        <section aria-labelledby="group">
          <SectionHeading eyebrow="Roblox" title={<span id="group">Roblox group</span>} description="Why join the group?" className="mb-10" />
          <GroupPromo settings={settings} group={group} />
          {groupGames.length > 0 && (
            <div className="mt-14">
              <h3 className="mb-6 text-xl font-semibold text-white">Games from the group</h3>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {groupGames.map((game, i) => (
                  <Reveal as="li" key={game.id} delay={i * 0.06}>
                    <GameCard game={game} />
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section aria-labelledby="discord">
          <SectionHeading eyebrow="Discord" title={<span id="discord">Discord server</span>} description="What you get when you join." className="mb-10" />
          <DiscordPromo settings={settings} server={discord} />
        </section>

        <section aria-labelledby="announcements">
          <SectionHeading
            eyebrow="Bulletin"
            title={<span id="announcements">Community announcements</span>}
            action={
              <Link href="/updates?filter=community" className={buttonClass("secondary", "md")}>
                All news <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
            className="mb-10"
          />
          {announcements.length > 0 ? (
            <ul className="grid gap-5 md:grid-cols-3">
              {announcements.map((post, i) => (
                <Reveal as="li" key={post.id} delay={i * 0.06}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Megaphone} title="No community announcements yet">
              Events and community news will show up here.
            </EmptyState>
          )}
        </section>
      </div>
    </>
  );
}

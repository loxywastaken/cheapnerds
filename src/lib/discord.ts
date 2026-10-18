import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "./constants";

export type DiscordServer = {
  code: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  memberCount: number | null;
  onlineCount: number | null;
};

export function parseInviteCode(inviteUrl: string): string | null {
  const match = inviteUrl.trim().match(/(?:discord\.gg|discord(?:app)?\.com\/invite)\/([\w-]{2,32})/i);
  return match ? match[1] : null;
}

/**
 * Public invite metadata from Discord's documented invite endpoint (no bot token needed).
 * Returns approximate member / online counts exactly as Discord reports them.
 */
export async function getDiscordServer(inviteUrl: string): Promise<DiscordServer | null> {
  "use cache";
  cacheTag(CACHE_TAGS.discord);

  const code = parseInviteCode(inviteUrl);
  if (!code) {
    cacheLife("hours");
    return null;
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Discord API ${res.status}`);
    const data = (await res.json()) as {
      guild?: { id: string; name: string; icon: string | null; description: string | null };
      approximate_member_count?: number;
      approximate_presence_count?: number;
    };
    if (!data.guild) throw new Error("Invite has no guild");
    cacheLife("minutes");
    const { guild } = data;
    return {
      code,
      name: guild.name,
      description: guild.description,
      iconUrl: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=256`
        : null,
      memberCount: data.approximate_member_count ?? null,
      onlineCount: data.approximate_presence_count ?? null,
    };
  } catch (err) {
    console.warn("[discord]", err instanceof Error ? err.message : err);
    cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
    return null;
  }
}

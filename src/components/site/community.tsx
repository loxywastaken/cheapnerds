import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { DiscordIcon, RobloxIcon } from "@/components/ui/icons";
import type { DiscordServer } from "@/lib/discord";
import type { RobloxGroup } from "@/lib/roblox";
import type { FeatureItem, SiteSettings } from "@/lib/settings";
import { cn, formatNumber } from "@/lib/utils";
import { DEFAULT_LOGO } from "./logo";

/** Short perk list with hand-drawn style ticks. */
function Perks({ items, tone = "light" }: { items: FeatureItem[]; tone?: "light" | "dark" }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="flex gap-3">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill={tone === "dark" ? "#ffffff" : "#3fd43a"} stroke="#2a1b0b" strokeWidth="2.5" />
            <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke={tone === "dark" ? "#4450d4" : "#2a1b0b"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="leading-snug">
            <span className="font-semibold text-strong">{item.title}</span>
            {item.body && <span className="text-muted"> {item.body}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function GroupCard({ settings, group, className }: { settings: SiteSettings; group: RobloxGroup | null; className?: string }) {
  const name = group?.name || `${settings.siteName} Group`;
  const description = settings.roblox.descriptionOverride || group?.description || "";
  const banner = settings.roblox.bannerUrl || null;
  const joinUrl = settings.roblox.groupUrl;

  return (
    <div className={cn("panel flex flex-col overflow-hidden", className)}>
      {banner && (
        <div className="relative h-32 border-b-[3px] border-outline sm:h-40">
          <Image src={banner} alt="" fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 -rotate-3 overflow-hidden rounded-2xl border-[3px] border-outline bg-surface-3 shadow-[0_4px_0_var(--color-outline)]">
            <Image src={group?.iconUrl || settings.branding.logoUrl || DEFAULT_LOGO} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 text-2xl font-bold text-strong">
              <span className="truncate">{name}</span>
              {group?.verified && <BadgeCheck className="size-5 shrink-0 text-ice-deep" aria-label="Verified" />}
            </h3>
            <p className="text-sm text-muted">
              Roblox group
              {group?.memberCount != null && (
                <>
                  {" · "}
                  <span className="font-semibold text-strong">{formatNumber(group.memberCount)}</span> members
                </>
              )}
            </p>
          </div>
        </div>
        {description && <p className="mt-5 line-clamp-4 whitespace-pre-line leading-relaxed text-muted">{description}</p>}
        <Perks items={settings.roblox.reasons} />
        {joinUrl && (
          <div className="mt-auto pt-7">
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
              <RobloxIcon size={17} />
              Join the group
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function DiscordCard({ settings, server, className }: { settings: SiteSettings; server: DiscordServer | null; className?: string }) {
  const inviteUrl = settings.discord.inviteUrl;
  return (
    <div
      className={cn(
        "theme-night relative flex flex-col overflow-hidden rounded-3xl border-[3px] border-outline bg-[linear-gradient(160deg,#6f7bff,#5865f2_45%,#4450d4)] p-6 shadow-[0_6px_0_var(--color-outline)] sm:p-7",
        className,
      )}
    >
      <DiscordIcon size={200} className="pointer-events-none absolute -bottom-10 -right-8 text-white/10" />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 rotate-3 overflow-hidden rounded-2xl border-[3px] border-outline bg-[#5865F2] text-white shadow-[0_4px_0_var(--color-outline)]">
            {server?.iconUrl ? (
              <Image src={server.iconUrl} alt="" fill sizes="64px" className="object-cover" unoptimized={server.iconUrl.includes(".gif")} />
            ) : (
              <span className="grid size-full place-items-center">
                <DiscordIcon size={30} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-bold text-white">{server?.name || settings.siteName}</h3>
            <p className="text-sm text-white/80">
              Discord server
              {server?.onlineCount != null && (
                <>
                  {" · "}
                  <span className="font-semibold text-white">{formatNumber(server.onlineCount)}</span> online
                </>
              )}
              {server?.memberCount != null && (
                <>
                  {" · "}
                  <span className="font-semibold text-white">{formatNumber(server.memberCount)}</span> members
                </>
              )}
            </p>
          </div>
        </div>
        {(settings.discord.description || server?.description) && (
          <p className="mt-5 leading-relaxed text-white/85">{settings.discord.description || server?.description}</p>
        )}
        <Perks items={settings.discord.benefits} tone="dark" />
        <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:items-center">
          {inviteUrl && (
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "lg")}>
              <DiscordIcon size={19} className="text-[#5865F2]" />
              Join the Discord
            </a>
          )}
          {settings.discord.rulesUrl && (
            <a href={settings.discord.rulesUrl} target="_blank" rel="noopener noreferrer" className="font-display font-semibold text-white underline decoration-2 underline-offset-4 hover:no-underline">
              Read the rules
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import { ArrowUpRight, BadgeCheck, BookOpen, Users } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { DiscordIcon, RobloxIcon, featureIcons } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { DEFAULT_LOGO } from "./logo";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { DiscordServer } from "@/lib/discord";
import type { RobloxGroup } from "@/lib/roblox";
import type { FeatureItem, SiteSettings } from "@/lib/settings";
import { cn, formatNumber } from "@/lib/utils";

function FeatureGrid({ items, columns = 2 }: { items: FeatureItem[]; columns?: 2 | 4 }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", columns === 4 && "lg:grid-cols-4")}>
      {items.map((item, i) => {
        const Icon = featureIcons[item.icon];
        return (
          <Reveal as="li" key={`${item.title}-${i}`} delay={i * 0.06}>
            <SpotlightCard className="h-full p-5">
              <div className="mb-4 grid size-10 place-items-center rounded-xl border border-line bg-surface-2 text-brand-soft">
                <Icon className="size-[1.1rem]" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-strong">{item.title}</h3>
              {item.body && <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>}
            </SpotlightCard>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** Live member count chip. Renders nothing when Roblox/Discord didn't report a number. */
function LiveCount({ value, label, pulse }: { value: number | null | undefined; label: string; pulse?: boolean }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-outline bg-surface px-3 py-1.5 text-sm text-fg shadow-[0_2px_0_var(--color-outline)]">
      <span className={cn("size-2 rounded-full", pulse ? "animate-pulse-dot bg-ok" : "bg-brand-soft")} aria-hidden="true" />
      <span className="font-semibold tabular-nums">{formatNumber(value)}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}

export function GroupPromo({
  settings,
  group,
  withReasons = true,
}: {
  settings: SiteSettings;
  group: RobloxGroup | null;
  withReasons?: boolean;
}) {
  const name = group?.name || `${settings.siteName} Group`;
  const description = settings.roblox.descriptionOverride || group?.description || "";
  const banner = settings.roblox.bannerUrl || null;
  const joinUrl = settings.roblox.groupUrl;

  return (
    <div className="space-y-6">
      <Reveal>
        <SpotlightCard className="overflow-hidden">
          <div className="relative h-40 overflow-hidden sm:h-56">
            {banner ? (
              <Image src={banner} alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_15%_120%,rgb(255_170_30/0.45),transparent_60%),radial-gradient(ellipse_at_95%_0%,rgb(168_207_234/0.18),transparent_55%),var(--color-surface-2)]">
                <div className="sunburst absolute left-[12%] top-full size-[70rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" aria-hidden="true" />
          </div>
          <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative size-24 shrink-0 -rotate-3 overflow-hidden rounded-3xl border-[3px] border-outline bg-surface-3 shadow-[0_5px_0_var(--color-outline)] sm:size-28">
                  <Image src={group?.iconUrl || settings.branding.logoUrl || DEFAULT_LOGO} alt={`${name} icon`} fill sizes="112px" className="object-cover" />
                </div>
                <div className="pb-1">
                  <p className="eyebrow !text-[0.66rem]">Official Roblox group</p>
                  <h3 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-strong sm:text-3xl">
                    {name}
                    {group?.verified && <BadgeCheck className="size-5 text-ice-soft" aria-label="Verified" />}
                  </h3>
                </div>
              </div>
              {joinUrl && (
                <a href={joinUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md", "relative z-[4] w-full sm:w-auto")}>
                  <RobloxIcon size={16} />
                  Join Group
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <LiveCount value={group?.memberCount} label="members" />
              {group?.ownerName && (
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-outline bg-surface px-3 py-1.5 text-sm text-muted shadow-[0_2px_0_var(--color-outline)]">
                  <Users className="size-3.5" aria-hidden="true" /> Owned by {group.ownerName}
                </span>
              )}
            </div>
            {description && <p className="mt-5 max-w-3xl whitespace-pre-line text-[0.95rem] leading-relaxed text-muted">{description}</p>}
          </div>
        </SpotlightCard>
      </Reveal>
      {withReasons && <FeatureGrid items={settings.roblox.reasons} columns={4} />}
    </div>
  );
}

export function DiscordPromo({
  settings,
  server,
  withBenefits = true,
}: {
  settings: SiteSettings;
  server: DiscordServer | null;
  withBenefits?: boolean;
}) {
  const inviteUrl = settings.discord.inviteUrl;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <Reveal className="h-full">
        <div className="theme-night relative h-full overflow-hidden rounded-3xl border-[3px] border-outline bg-[linear-gradient(160deg,#6f7bff,#5865f2_45%,#4450d4)] p-6 shadow-[0_6px_0_var(--color-outline)] sm:p-8">
          <DiscordIcon size={220} className="pointer-events-none absolute -bottom-10 -right-8 text-white/10" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-outline bg-[#5865F2] text-white shadow-[0_3px_0_var(--color-outline)]">
                {server?.iconUrl ? (
                  <Image src={server.iconUrl} alt={`${server.name} server icon`} fill sizes="64px" className="object-cover" unoptimized={server.iconUrl.includes(".gif")} />
                ) : (
                  <span className="grid size-full place-items-center">
                    <DiscordIcon size={30} />
                  </span>
                )}
              </div>
              <div>
                <p className="eyebrow !text-white/85">Discord community</p>
                <h3 className="mt-1 text-2xl font-semibold text-strong sm:text-3xl">{server?.name || settings.siteName}</h3>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <LiveCount value={server?.onlineCount} label="online now" pulse />
              <LiveCount value={server?.memberCount} label="members" />
            </div>
            <p className="mt-5 max-w-lg leading-relaxed text-fg/80">{settings.discord.description || server?.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {inviteUrl && (
                <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("discord", "lg")}>
                  <DiscordIcon size={19} />
                  Join Discord
                </a>
              )}
              {settings.discord.rulesUrl && (
                <a href={settings.discord.rulesUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "lg")}>
                  <BookOpen className="size-4" aria-hidden="true" />
                  Server rules
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
      {withBenefits && <FeatureGrid items={settings.discord.benefits} />}
    </div>
  );
}

import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";
import { DiscordIcon, GitHubIcon, RobloxIcon, TikTokIcon, XIcon, YouTubeIcon } from "@/components/ui/icons";
import { Logo } from "./logo";
import { LowPolyRidge } from "./low-poly";
import { NAV_LINKS } from "./nav-links";

export function SiteFooter({ settings, year }: { settings: SiteSettings; year: number }) {
  const socials = [
    { href: settings.roblox.groupUrl, label: "Roblox group", Icon: RobloxIcon },
    { href: settings.discord.inviteUrl, label: "Discord", Icon: DiscordIcon },
    { href: settings.socials.youtube, label: "YouTube", Icon: YouTubeIcon },
    { href: settings.socials.x, label: "X (Twitter)", Icon: XIcon },
    { href: settings.socials.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.socials.github, label: "GitHub", Icon: GitHubIcon },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-32">
      <LowPolyRidge className="-mb-px" />
      <div className="theme-night bg-surface">
        <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-block rounded-xl" aria-label={`${settings.siteName} home`}>
              <Logo siteName={settings.siteName} logoUrl={settings.branding.logoUrl} />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{settings.siteDescription}</p>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="grid size-10 place-items-center rounded-full border border-line bg-tint/[0.03] text-muted transition-colors hover:border-line-strong hover:text-strong"
                    >
                      <Icon size={17} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow mb-4 !text-subtle">Explore</h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-strong">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4 !text-subtle">Community</h2>
            <ul className="space-y-2.5 text-sm">
              {settings.roblox.groupUrl && (
                <li>
                  <a href={settings.roblox.groupUrl} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-strong">
                    Roblox group
                  </a>
                </li>
              )}
              {settings.discord.inviteUrl && (
                <li>
                  <a href={settings.discord.inviteUrl} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-strong">
                    Discord server
                  </a>
                </li>
              )}
              {settings.discord.rulesUrl && (
                <li>
                  <a href={settings.discord.rulesUrl} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-strong">
                    Community rules
                  </a>
                </li>
              )}
              <li>
                <Link href="/updates" className="text-muted transition-colors hover:text-strong">
                  News & updates
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="container-page flex flex-col gap-2 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {settings.siteName}. All rights reserved.
            </p>
            <p>Not affiliated with or endorsed by Roblox Corporation or Discord Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

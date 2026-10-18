import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { AnalyticsBeacon } from "@/components/site/analytics-beacon";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSettings } from "@/lib/data";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, year] = await Promise.all([getSettings(), currentYear()]);
  const { announcement } = settings;
  const announcementHref = announcement.href.startsWith("/") || /^https?:\/\//.test(announcement.href) ? announcement.href : "";

  return (
    <div className="theme-cartoon min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <SiteHeader
        siteName={settings.siteName}
        logoUrl={settings.branding.logoUrl || undefined}
        discordUrl={settings.discord.inviteUrl || undefined}
        announcement={announcement.enabled && announcement.text ? { text: announcement.text, href: announcementHref } : undefined}
      />
      <main id="main">
        {children}
      </main>
      <SiteFooter settings={settings} year={year} />
      <Suspense fallback={null}>
        <AnalyticsBeacon />
      </Suspense>
    </div>
  );
}

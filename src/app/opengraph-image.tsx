import { getSettings } from "@/lib/data";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Cheap Nerds — Roblox game studio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const settings = await getSettings();
  return renderOgImage({ eyebrow: "Roblox games", title: settings.hero.title, subtitle: settings.hero.subtitle, siteName: settings.siteName });
}

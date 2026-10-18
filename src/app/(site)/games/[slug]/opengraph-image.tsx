import { GAME_STATUS_LABELS } from "@/lib/constants";
import { getGame, getSettings } from "@/lib/data";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Cheap Nerds game";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function GameOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [game, settings] = await Promise.all([getGame(slug), getSettings()]);
  if (!game) return renderOgImage({ eyebrow: "Roblox game", title: settings.siteName, siteName: settings.siteName });
  return renderOgImage({
    eyebrow: `Roblox game · ${GAME_STATUS_LABELS[game.status]}`,
    title: game.name,
    subtitle: game.tagline,
    image: game.iconUrl ?? game.thumbnailUrl,
    siteName: settings.siteName,
  });
}

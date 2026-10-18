import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: settings.siteName,
    short_name: settings.siteName,
    description: settings.siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0d0b0a",
    theme_color: "#ffb21a",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

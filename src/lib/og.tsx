import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "./utils";

export const OG_SIZE = { width: 1200, height: 630 };

let assetsPromise: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 700 }[]; logo: string; pattern: string }> | undefined;
function loadAssets() {
  assetsPromise ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Fredoka-Bold.ttf")),
    readFile(join(process.cwd(), "public/brand/logo.png")),
    readFile(join(process.cwd(), "public/patterns/lowpoly.svg")),
  ]).then(([geist, fredoka, logo, pattern]) => ({
    fonts: [
      { name: "Geist", data: geist, weight: 400 as const },
      { name: "Fredoka", data: fredoka, weight: 700 as const },
    ],
    logo: `data:image/png;base64,${logo.toString("base64")}`,
    pattern: `data:image/svg+xml;base64,${pattern.toString("base64")}`,
  }));
  return assetsPromise;
}

function absolute(src: string | null | undefined) {
  if (!src) return null;
  return src.startsWith("/") ? siteUrl(src) : src;
}

/** Branded 1200×630 social card used for Discord/Twitter link previews. */
export async function renderOgImage({
  eyebrow,
  title,
  subtitle,
  image,
  siteName = "Cheap Nerds",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  siteName?: string;
}) {
  const { fonts, logo, pattern } = await loadAssets();
  const img = absolute(image);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#ffd43b",
          padding: 64,
          fontFamily: "Geist",
          color: "#2a1b0b",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img src={pattern} alt="" width={1200} height={880} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 880 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
            <img src={logo} alt="" width={64} height={64} style={{ borderRadius: 16, border: "4px solid #2a1b0b" }} />
            <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 34, textTransform: "uppercase", letterSpacing: 1 }}>
              <span style={{ color: "#c2410c" }}>{siteName.split(" ")[0]}</span>
              <span style={{ color: "#1d4e89", marginLeft: 10 }}>{siteName.split(" ").slice(1).join(" ")}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignSelf: "flex-start", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#2a1b0b", background: "#ffffff", border: "4px solid #2a1b0b", borderRadius: 999, padding: "6px 18px", marginBottom: 22 }}>{eyebrow}</div>
            <div style={{ fontFamily: "Fredoka", fontSize: 72, lineHeight: 1.04, color: "#1f1306" }}>
              {title.length > 60 ? `${title.slice(0, 58)}…` : title}
            </div>
            {subtitle && (
              <div style={{ marginTop: 20, fontSize: 28, lineHeight: 1.35, color: "#5e4520" }}>
                {subtitle.length > 120 ? `${subtitle.slice(0, 118)}…` : subtitle}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img
            src={img ?? logo}
            alt=""
            width={440}
            height={440}
            style={{ width: 440, height: 440, objectFit: "cover", borderRadius: 40, border: "6px solid #2a1b0b", boxShadow: "0 12px 0 #2a1b0b" }}
          />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })) },
  );
}

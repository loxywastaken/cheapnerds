import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "./utils";

export const OG_SIZE = { width: 1200, height: 630 };

let assetsPromise: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 700 }[]; logo: string }> | undefined;
function loadAssets() {
  assetsPromise ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Geist-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/fonts/Fredoka-Bold.ttf")),
    readFile(join(process.cwd(), "public/brand/logo.png")),
  ]).then(([geist, fredoka, logo]) => ({
    fonts: [
      { name: "Geist", data: geist, weight: 400 as const },
      { name: "Fredoka", data: fredoka, weight: 700 as const },
    ],
    logo: `data:image/png;base64,${logo.toString("base64")}`,
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
  const { fonts, logo } = await loadAssets();
  const img = absolute(image);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0d0b0a",
          backgroundImage:
            "radial-gradient(circle at 78% 50%, rgba(255,170,30,0.35), transparent 50%), radial-gradient(circle at 0% 0%, rgba(255,120,0,0.18), transparent 40%)",
          padding: 64,
          fontFamily: "Geist",
          color: "#f7f3ee",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
            <img src={logo} alt="" width={64} height={64} style={{ borderRadius: 16, border: "2px solid rgba(255,200,80,0.5)" }} />
            <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 34, textTransform: "uppercase", letterSpacing: 1 }}>
              <span style={{ color: "#ffc21f" }}>{siteName.split(" ")[0]}</span>
              <span style={{ color: "#eef6fd", marginLeft: 10 }}>{siteName.split(" ").slice(1).join(" ")}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#ffb21a", marginBottom: 18 }}>{eyebrow}</div>
            <div style={{ fontFamily: "Fredoka", fontSize: 72, lineHeight: 1.04, color: "#ffffff" }}>
              {title.length > 60 ? `${title.slice(0, 58)}…` : title}
            </div>
            {subtitle && (
              <div style={{ marginTop: 20, fontSize: 28, lineHeight: 1.35, color: "#b0a79c" }}>
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
            style={{ width: 440, height: 440, objectFit: "cover", borderRadius: 40, border: "3px solid rgba(255,200,80,0.45)", boxShadow: "0 20px 60px rgba(255,150,0,0.35)" }}
          />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })) },
  );
}

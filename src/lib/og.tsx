import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteUrl } from "./utils";

export const OG_SIZE = { width: 1200, height: 630 };

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 700 }[]> | undefined;
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/BricolageGrotesque-SemiBold.ttf")).then((data) => ({ name: "Bricolage", data, weight: 600 as const })),
    readFile(join(process.cwd(), "src/assets/fonts/Geist-Regular.ttf")).then((data) => ({ name: "Geist", data, weight: 400 as const })),
    readFile(join(process.cwd(), "src/assets/fonts/Fredoka-Bold.ttf")).then((data) => ({ name: "Fredoka", data, weight: 700 as const })),
  ]);
  return fontsPromise;
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
  const fonts = await loadFonts();
  const img = absolute(image);
  const [first, ...rest] = siteName.split(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0b0b0f",
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(139,92,246,0.35), transparent 45%), radial-gradient(circle at 100% 100%, rgba(59,130,246,0.25), transparent 45%)",
          padding: 64,
          fontFamily: "Geist",
          color: "#f4f4f7",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: img ? 48 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 52, height: 52, borderRadius: 14, background: "#1d1d28", border: "1px solid rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", fontFamily: "Fredoka", fontSize: 26 }}>
              <span style={{ color: "#ffb23f" }}>C</span>
              <span style={{ color: "#e6f3ff" }}>N</span>
            </div>
            <div style={{ display: "flex", fontFamily: "Fredoka", fontSize: 34 }}>
              <span style={{ color: "#ffb23f" }}>{first}</span>
              {rest.length > 0 && <span style={{ color: "#e6f3ff", marginLeft: 10 }}>{rest.join(" ")}</span>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#b9a3ff", marginBottom: 18 }}>{eyebrow}</div>
            <div style={{ fontFamily: "Bricolage", fontSize: img ? 64 : 80, lineHeight: 1.04, letterSpacing: -2, color: "#ffffff" }}>
              {title.length > 70 ? `${title.slice(0, 68)}…` : title}
            </div>
            {subtitle && (
              <div style={{ marginTop: 20, fontSize: 28, lineHeight: 1.35, color: "#a3a3b2" }}>
                {subtitle.length > 120 ? `${subtitle.slice(0, 118)}…` : subtitle}
              </div>
            )}
          </div>
        </div>
        {img && (
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
            <img
              src={img}
              alt=""
              width={460}
              height={460}
              style={{ width: 460, height: 460, objectFit: "cover", borderRadius: 36, border: "2px solid rgba(255,255,255,0.12)" }}
            />
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })) },
  );
}

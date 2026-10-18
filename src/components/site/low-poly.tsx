import { cn } from "@/lib/utils";

const GEM_COLORS = {
  orange: ["#ffb347", "#ff8c1a", "#e86a00", "#ffd08a", "#c65400"],
  ice: ["#bfe3ff", "#7cc2f5", "#4f9fdc", "#e6f4ff", "#3a7fb8"],
  pink: ["#ffb3d1", "#ff7eb0", "#e85590", "#ffd6e6", "#c23d75"],
  green: ["#a8f08a", "#6fd64f", "#45b530", "#d4ffc2", "#2f8f1f"],
  purple: ["#d5b8ff", "#ad85ff", "#8a5cf0", "#ece0ff", "#6a3fd0"],
} as const;

export type GemColor = keyof typeof GEM_COLORS;

/** Faceted low-poly crystal with a cartoon ink outline. */
export function LowPolyGem({ color = "orange", className }: { color?: GemColor; className?: string }) {
  const [mid, side, dark, light, deep] = GEM_COLORS[color];
  return (
    <svg viewBox="0 0 100 120" className={cn("overflow-visible", className)} aria-hidden="true">
      <g stroke="#2a1b0b" strokeWidth="4" strokeLinejoin="round">
        <polygon points="50,4 82,34 50,116 18,34" fill={mid} />
        <polygon points="50,4 18,34 50,46" fill={light} />
        <polygon points="50,4 82,34 50,46" fill={mid} />
        <polygon points="18,34 50,46 50,116" fill={side} />
        <polygon points="82,34 50,46 50,116" fill={dark} />
        <polygon points="18,34 4,40 50,116" fill={deep} />
        <polygon points="82,34 96,40 50,116" fill={deep} />
        <polygon points="18,34 4,40 50,4" fill={side} />
        <polygon points="82,34 96,40 50,4" fill={dark} />
      </g>
      <polygon points="40,16 47,10 44,28" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}

/** Low-poly cube "pet" block with a cheeky face, like the blocky pets in Roblox simulators. */
export function LowPolyCube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn("overflow-visible", className)} aria-hidden="true">
      <g stroke="#2a1b0b" strokeWidth="4" strokeLinejoin="round">
        <polygon points="60,8 108,32 60,56 12,32" fill="#eaf5ff" />
        <polygon points="12,32 60,56 60,112 12,86" fill="#bcdcf5" />
        <polygon points="108,32 60,56 60,112 108,86" fill="#8fbfe6" />
      </g>
      <ellipse cx="28" cy="62" rx="6" ry="8" fill="#2a1b0b" transform="skewY(26) translate(0,-14)" />
      <ellipse cx="46" cy="70" rx="6" ry="8" fill="#2a1b0b" transform="skewY(26) translate(0,-22)" />
      <circle cx="27" cy="45" r="2" fill="#fff" />
      <circle cx="45" cy="53" r="2" fill="#fff" />
      <path d="M30 82 q6 6 12 2" fill="none" stroke="#2a1b0b" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Jagged low-poly mountain ridge used as a divider above the footer. */
export function LowPolyRidge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={cn("block h-16 w-full sm:h-24", className)} aria-hidden="true">
      <polygon points="0,120 0,70 90,30 170,78 260,20 360,72 440,40 540,86 640,26 720,64 820,18 920,74 1010,36 1110,82 1200,30 1300,70 1380,44 1440,60 1440,120" fill="#2a1b0b" />
      <polygon points="90,30 130,120 50,120" fill="#3a2711" />
      <polygon points="260,20 310,120 220,120" fill="#3a2711" />
      <polygon points="640,26 690,120 600,120" fill="#3a2711" />
      <polygon points="820,18 870,120 780,120" fill="#3a2711" />
      <polygon points="1200,30 1250,120 1160,120" fill="#3a2711" />
      <polyline
        points="0,70 90,30 170,78 260,20 360,72 440,40 540,86 640,26 720,64 820,18 920,74 1010,36 1110,82 1200,30 1300,70 1380,44 1440,60"
        fill="none"
        stroke="#2a1b0b"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SCENES = [
  { sky: ["#7cc8ff", "#bfe6ff"], hills: ["#5fd068", "#3fb64d", "#2f9a3e", "#78e07e"], ray: "rgb(255 255 255 / 0.35)", gems: ["pink", "orange"] },
  { sky: ["#ff9a5c", "#ffd36b"], hills: ["#e86a3a", "#c9542a", "#f08a4e", "#a8401f"], ray: "rgb(255 255 255 / 0.3)", gems: ["ice", "purple"] },
  { sky: ["#6b5bd6", "#a98bff"], hills: ["#4b3fa8", "#3a2f8c", "#5d50c4", "#2c2370"], ray: "rgb(255 255 255 / 0.18)", gems: ["green", "orange"] },
  { sky: ["#4fd1c5", "#b6f5ec"], hills: ["#2fb59a", "#24967f", "#3fcca9", "#1b7a67"], ray: "rgb(255 255 255 / 0.3)", gems: ["pink", "purple"] },
] as const;

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Cartoon low-poly scene (sky, sunburst, faceted hills, a blocky pet and gems) used
 * wherever real artwork isn't available yet. The palette is picked from `seed`, so the
 * same item always gets the same scene.
 */
export function LowPolyScene({ seed, compact = false, className }: { seed: string; compact?: boolean; className?: string }) {
  const s = SCENES[hash(seed) % SCENES.length];
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: `linear-gradient(180deg, ${s.sky[0]}, ${s.sky[1]})` }}
      aria-hidden="true"
    >
      <div
        className="absolute left-1/2 top-[55%] size-[260%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow"
        style={{ background: `repeating-conic-gradient(from 0deg, ${s.ray} 0deg 6deg, transparent 6deg 18deg)` }}
      />
      {!compact && (
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
          <g fill="#ffffff" opacity="0.9">
            <polygon points="40,52 62,38 88,44 104,60 30,64" />
            <polygon points="62,38 76,26 96,34 88,44" opacity="0.8" />
            <polygon points="290,40 316,28 344,34 358,50 280,52" />
            <polygon points="316,28 332,18 350,26 344,34" opacity="0.8" />
          </g>
          <polygon points="0,225 0,160 50,130 95,165 150,120 210,170 260,128 320,162 370,132 400,150 400,225" fill={s.hills[2]} />
          <polygon points="50,130 95,165 30,225 0,225 0,160" fill={s.hills[3]} />
          <polygon points="150,120 210,170 120,225 95,165" fill={s.hills[0]} />
          <polygon points="260,128 320,162 250,225 210,170" fill={s.hills[3]} />
          <polygon points="370,132 400,150 400,225 320,162" fill={s.hills[0]} />
          <polygon points="0,225 0,190 70,175 140,200 200,182 270,205 340,180 400,196 400,225" fill={s.hills[1]} />
          <polyline points="0,160 50,130 95,165 150,120 210,170 260,128 320,162 370,132 400,150" fill="none" stroke="#2a1b0b" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )}
      <LowPolyCube
        className={cn(
          "absolute left-1/2 -translate-x-1/2 animate-float [animation-duration:5s]",
          compact ? "top-1/2 w-[62%] -translate-y-1/2" : "top-[22%] w-[24%] max-w-40",
        )}
      />
      {!compact && (
        <>
          <LowPolyGem color={s.gems[0]} className="absolute left-[22%] top-[30%] w-[8%] max-w-12 -rotate-12 animate-float [animation-delay:-2s] [animation-duration:6s]" />
          <LowPolyGem color={s.gems[1]} className="absolute right-[21%] top-[38%] w-[7%] max-w-10 rotate-12 animate-float [animation-delay:-4s] [animation-duration:7s]" />
        </>
      )}
    </div>
  );
}

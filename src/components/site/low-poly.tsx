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

import {
  Calendar,
  FlaskConical,
  Gamepad2,
  Gift,
  Heart,
  Megaphone,
  MessageCircle,
  Rocket,
  Shield,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SVGProps } from "react";
import type { FeatureIcon } from "@/lib/constants";

export const featureIcons: Record<FeatureIcon, LucideIcon> = {
  sparkles: Sparkles,
  gamepad: Gamepad2,
  users: Users,
  megaphone: Megaphone,
  gift: Gift,
  trophy: Trophy,
  calendar: Calendar,
  flask: FlaskConical,
  shield: Shield,
  message: MessageCircle,
  rocket: Rocket,
  heart: Heart,
};

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/* Brand marks aren't part of Lucide, so they're drawn here at Lucide's 24px grid. */

export function DiscordIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.27 5.33A16.6 16.6 0 0 0 15.1 4l-.2.4a15.3 15.3 0 0 1 3.7 1.9 13 13 0 0 0-13.2 0A15.3 15.3 0 0 1 9.1 4.4L8.9 4a16.6 16.6 0 0 0-4.17 1.33C2.07 9.3 1.35 13.18 1.7 17a16.7 16.7 0 0 0 5.1 2.6l1.1-1.8a10.8 10.8 0 0 1-1.73-.84l.42-.33a11.9 11.9 0 0 0 10.82 0l.42.33c-.55.33-1.13.61-1.73.84l1.1 1.8a16.7 16.7 0 0 0 5.1-2.6c.42-4.42-.71-8.27-3.06-11.67ZM8.9 14.73c-1 0-1.83-.93-1.83-2.07s.8-2.07 1.83-2.07 1.85.94 1.83 2.07c0 1.14-.81 2.07-1.83 2.07Zm6.2 0c-1 0-1.83-.93-1.83-2.07s.8-2.07 1.83-2.07 1.85.94 1.83 2.07c0 1.14-.8 2.07-1.83 2.07Z" />
    </svg>
  );
}

export function RobloxIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.16 1.5 1.5 18.84l17.34 3.66L22.5 5.16 5.16 1.5Zm8.7 13.88-4.24-.9.9-4.24 4.24.9-.9 4.24Z" />
    </svg>
  );
}

export function YouTubeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    </svg>
  );
}

export function XIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z" />
    </svg>
  );
}

export function TikTokIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64A5.7 5.7 0 0 0 9.86 21c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.25-1.48Z" />
    </svg>
  );
}

export function GitHubIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.85c-2.92.63-3.54-1.24-3.54-1.24-.48-1.22-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.06.07 1.61 1.09 1.61 1.09.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.15.41-2.08 1.08-2.82-.1-.26-.47-1.33.1-2.77 0 0 .88-.28 2.89 1.08a10 10 0 0 1 5.25 0c2-1.36 2.88-1.08 2.88-1.08.58 1.44.21 2.51.1 2.77.68.74 1.09 1.67 1.09 2.82 0 4.02-2.46 4.9-4.8 5.16.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "discord" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-display font-semibold tracking-wide transition-[transform,background-color,border-color,color,box-shadow,filter] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50";

// Cartoon "game UI" buttons: thick ink outline, glossy top highlight and a solid
// offset shadow that squishes down when pressed.
const chunky =
  "border-[3px] border-outline shadow-[inset_0_-4px_0_rgb(0_0_0/0.14),inset_0_2px_0_rgb(255_255_255/0.55),0_4px_0_var(--color-outline)] hover:-translate-y-0.5 hover:shadow-[inset_0_-4px_0_rgb(0_0_0/0.14),inset_0_2px_0_rgb(255_255_255/0.55),0_6px_0_var(--color-outline)] active:translate-y-[3px] active:shadow-[inset_0_-2px_0_rgb(0_0_0/0.14),inset_0_2px_0_rgb(255_255_255/0.4),0_1px_0_var(--color-outline)]";

const variants: Record<Variant, string> = {
  // Green "PLAY" button, straight out of a Roblox simulator.
  primary: `${chunky} bg-[linear-gradient(180deg,#7cf06a_0%,#3fd43a_55%,#24b02a_100%)] text-[#0f2a0c]`,
  accent: `${chunky} bg-[linear-gradient(180deg,#ffe656_0%,#ffc21f_50%,#ff9f0f_100%)] text-brand-ink`,
  secondary: `${chunky} bg-white text-[#2a1b0b] hover:bg-[#fffbea]`,
  ghost: "text-muted hover:bg-tint/[0.08] hover:text-strong",
  discord: `${chunky} bg-[linear-gradient(180deg,#7c86ff_0%,#5865f2_60%,#4752d6_100%)] text-white [text-shadow:0_2px_0_rgb(20_20_80/0.45)]`,
  danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({ variant, size, className, ...props }: CommonProps & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

/** Internal links use next/link; absolute URLs open in a new tab with safe rel attributes. */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: CommonProps & { href: string } & Omit<ComponentProps<"a">, "href">) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

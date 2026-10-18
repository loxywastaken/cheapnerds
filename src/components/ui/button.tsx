import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "discord" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50";

// "Bubbly" buttons echo the chunky, outlined lettering of the logo: a glossy top
// highlight and a solid darker base that presses down on click.
const gold =
  "bg-[linear-gradient(180deg,#ffe656_0%,#ffc21f_45%,#ff9f0f_100%)] font-semibold text-brand-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.65),inset_0_-2px_0_rgb(160_60_0/0.25),0_3px_0_#b45200,0_10px_28px_-8px_rgb(255_170_20/0.55)] hover:-translate-y-px hover:brightness-105 active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_1px_0_#b45200,0_6px_18px_-8px_rgb(255_170_20/0.5)]";

const variants: Record<Variant, string> = {
  primary: gold,
  accent: gold,
  secondary:
    "border border-ice-soft/20 bg-ice/[0.04] text-fg backdrop-blur hover:border-ice-soft/40 hover:bg-ice/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-fg",
  discord:
    "bg-[#5865F2] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_3px_0_#3a43b8,0_10px_28px_-10px_rgb(88_101_242/0.9)] hover:-translate-y-px hover:bg-[#6873f5] active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_0_#3a43b8]",
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

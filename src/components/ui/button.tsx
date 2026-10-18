import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "discord" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-ink shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_8px_30px_-8px_rgb(167_139_250/0.55)] hover:bg-ice hover:shadow-[0_0_0_1px_rgb(255_255_255/0.3),0_12px_40px_-8px_rgb(167_139_250/0.75)]",
  accent:
    "bg-violet text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_8px_30px_-10px_rgb(139_92_246/0.8)] hover:bg-[#9a70ff]",
  secondary: "border border-line-strong bg-white/[0.04] text-fg backdrop-blur hover:border-white/25 hover:bg-white/[0.08]",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-fg",
  discord:
    "bg-[#5865F2] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_8px_30px_-10px_rgb(88_101_242/0.9)] hover:bg-[#6873f5]",
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

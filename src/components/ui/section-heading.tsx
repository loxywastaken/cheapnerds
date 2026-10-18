import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow sticker mb-4">{eyebrow}</p>}
        <h2 className="text-3xl font-bold text-strong sm:text-[2.75rem]">{title}</h2>
        {description && <p className="mt-3 text-base font-medium text-muted sm:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden="true" />
      <div className="sunburst pointer-events-none absolute left-[18%] top-0 size-[90rem] -translate-x-1/2 -translate-y-1/2 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-[18%] h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.5),transparent)]" aria-hidden="true" />
      <div className="container-page relative pb-14 pt-32 sm:pb-16 sm:pt-40">
        <p className="eyebrow sticker mb-5">{eyebrow}</p>
        <h1 className="text-outline-white max-w-3xl text-[2.6rem] font-bold leading-[1.05] sm:text-7xl">{title}</h1>
        {description && <p className="mt-6 max-w-2xl text-lg font-medium text-strong/80">{description}</p>}
        {children}
      </div>
    </header>
  );
}

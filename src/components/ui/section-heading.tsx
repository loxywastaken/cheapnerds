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
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-base text-muted sm:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-violet/15 blur-[120px]" aria-hidden="true" />
      <div className="container-page relative pb-14 pt-32 sm:pb-16 sm:pt-40">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-semibold text-white sm:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-lg text-muted">{description}</p>}
        {children}
      </div>
    </header>
  );
}

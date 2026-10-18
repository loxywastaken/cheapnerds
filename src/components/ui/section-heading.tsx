import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6", className)}>
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-strong sm:text-[2.75rem]">{title}</h2>
        {description && <p className="mt-2 text-lg text-strong/75">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Plain underlined link used for "see all" style actions. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-display text-lg font-semibold text-strong underline decoration-[3px] underline-offset-[6px] transition-[text-decoration-color] hover:decoration-transparent"
    >
      {children} →
    </Link>
  );
}

export function PageHeader({ title, description, children }: { title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden">
      <div className="sunburst pointer-events-none absolute left-[18%] top-0 size-[90rem] -translate-x-1/2 -translate-y-1/2 opacity-70" aria-hidden="true" />
      <div className="container-page relative pb-10 pt-32 sm:pb-12 sm:pt-40">
        <h1 className="text-outline-white max-w-3xl text-[2.75rem] font-bold leading-[1.05] sm:text-7xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-lg font-medium text-strong/80">{description}</p>}
        {children}
      </div>
    </header>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Square "CN" brand mark, echoing the bubbly orange-and-ice Cheap Nerds logo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="cn-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d1d28" />
          <stop offset="1" stopColor="#121219" />
        </linearGradient>
        <linearGradient id="cn-mark-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd36b" />
          <stop offset="1" stopColor="#ff9a1f" />
        </linearGradient>
        <linearGradient id="cn-mark-n" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bfe0ff" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill="url(#cn-mark-bg)" stroke="rgb(255 255 255 / 0.12)" />
      <path d="M17.6 13.2a7.4 7.4 0 1 0 0 13.6" fill="none" stroke="url(#cn-mark-c)" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M19.8 27V13.4l7.6 13.4V13.2" fill="none" stroke="url(#cn-mark-n)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ logoUrl, siteName, className }: { logoUrl?: string; siteName: string; className?: string }) {
  if (logoUrl) {
    return (
      <span className={cn("relative block h-9 w-28", className)}>
        <Image src={logoUrl} alt={siteName} fill sizes="112px" className="object-contain object-left" preload />
      </span>
    );
  }
  const [first, ...rest] = siteName.split(" ");
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-logo text-[1.2rem] font-semibold leading-none tracking-tight">
        <span className="text-spark">{first}</span>
        {rest.length > 0 && <span className="text-ice"> {rest.join(" ")}</span>}
      </span>
    </span>
  );
}

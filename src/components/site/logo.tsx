import Image from "next/image";
import { cn } from "@/lib/utils";

export const DEFAULT_LOGO = "/brand/logo.png";

/** The square Cheap Nerds logo badge (orange starburst with the bubbly wordmark). */
export function LogoMark({ className, src = DEFAULT_LOGO }: { className?: string; src?: string }) {
  return (
    <span
      className={cn(
        "relative block size-10 shrink-0 overflow-hidden rounded-xl border-[2.5px] border-outline shadow-[0_3px_0_var(--color-outline)]",
        className,
      )}
    >
      <Image src={src} alt="" fill sizes="80px" className="object-cover" preload />
    </span>
  );
}

/** Header/footer lockup: logo badge plus a bubbly two-tone wordmark matching the logo. */
export function Logo({ logoUrl, siteName, className }: { logoUrl?: string; siteName: string; className?: string }) {
  const [first, ...rest] = siteName.split(" ");
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark src={logoUrl || DEFAULT_LOGO} />
      <span className="font-logo text-[1.3rem] font-bold uppercase leading-none tracking-wide">
        <span className="text-outline-gold">{first}</span>
        {rest.length > 0 && <span className="text-outline-ice"> {rest.join(" ")}</span>}
      </span>
    </span>
  );
}

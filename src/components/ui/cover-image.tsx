import Image from "next/image";
import { Gamepad2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Responsive, lazily loaded image that fills its (relatively positioned) parent.
 * Renders a quiet branded placeholder when no image is available, never a fake one.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  preload,
  className,
  fallbackIcon: FallbackIcon = Gamepad2,
  zoom = true,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  fallbackIcon?: LucideIcon;
  zoom?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn("absolute inset-0 grid place-items-center bg-surface-2", className)} role="img" aria-label={alt}>
        <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_178_26/0.18),transparent_60%)]" aria-hidden="true" />
        <FallbackIcon className="relative size-10 text-white/20" aria-hidden="true" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      loading={preload ? undefined : "lazy"}
      className={cn(
        "object-cover",
        zoom && "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
        className,
      )}
    />
  );
}

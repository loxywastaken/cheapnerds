import Image from "next/image";
import { LowPolyScene } from "@/components/site/low-poly";
import { cn } from "@/lib/utils";

/**
 * Responsive, lazily loaded image that fills its (relatively positioned) parent.
 * Without an image it shows a cartoon low-poly scene (seeded by `seed`) instead of an empty box.
 */
export function CoverImage({
  src,
  alt,
  sizes,
  preload,
  className,
  seed,
  zoom = true,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  seed?: string;
  zoom?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn("absolute inset-0", className)} role={alt ? "img" : undefined} aria-label={alt || undefined}>
        <LowPolyScene seed={seed || alt || "cheap-nerds"} />
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

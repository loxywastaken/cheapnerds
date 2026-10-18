"use client";

import { useRef, type ComponentProps, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** A panel whose border and background light up around the cursor. */
export function SpotlightCard({ className, onPointerMove, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (el && event.pointerType === "mouse") {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  }

  return <div ref={ref} onPointerMove={handleMove} className={cn("panel spotlight", className)} {...props} />;
}

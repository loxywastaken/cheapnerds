"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/** Screenshot carousel with thumbnail strip, swipe support and a keyboard-friendly lightbox. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (count === 0) return null;

  const slide = (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={index}
        custom={direction}
        className="absolute inset-0"
        initial={{ opacity: 0, x: direction * 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -40 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        drag={count > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(1);
          else if (info.offset.x > 60) go(-1);
        }}
      >
        <Image
          src={images[index]}
          alt={`${title} screenshot ${index + 1} of ${count}`}
          fill
          sizes="(min-width: 1280px) 820px, 100vw"
          className="pointer-events-none select-none object-cover"
          preload={index === 0}
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div>
      <div className="group relative aspect-video overflow-hidden rounded-3xl border border-line bg-surface-2">
        {slide}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-white/10 bg-ink/60 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-ink/80 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          aria-label="Open fullscreen"
        >
          <Expand className="size-4" />
        </button>
        {count > 1 && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-xs text-white backdrop-blur-md">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Screenshots">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                aria-label={`Show screenshot ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-video w-24 overflow-hidden rounded-xl border-2 transition-all sm:w-28",
                  i === index ? "border-violet-soft" : "border-transparent opacity-55 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightbox &&
        createPortal(
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} screenshots`}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => e.target === e.currentTarget && setLightbox(false)}
          >
            <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl">{slide}</div>
            <button
              type="button"
              autoFocus
              onClick={() => setLightbox(false)}
              className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            {count > 1 && (
              <>
                <ArrowButton side="left" onClick={() => go(-1)} large />
                <ArrowButton side="right" onClick={() => go(1)} large />
              </>
            )}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}

function ArrowButton({ side, onClick, large }: { side: "left" | "right"; onClick: () => void; large?: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous screenshot" : "Next screenshot"}
      className={cn(
        "absolute top-1/2 z-10 grid -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink/60 text-white backdrop-blur-md transition-colors hover:bg-ink/85",
        large ? "size-12" : "size-10",
        side === "left" ? (large ? "left-4" : "left-3") : large ? "right-4" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

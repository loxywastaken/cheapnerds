import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-24">
      <div className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/3 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-violet/20 blur-[140px]" aria-hidden="true" />
      <div className="max-w-lg text-center">
        <Link href="/" aria-label="Home" className="inline-block rounded-xl">
          <LogoMark className="mx-auto size-12" />
        </Link>
        <p className="mt-10 font-display text-[7rem] font-semibold leading-none tracking-tighter text-white/90 sm:text-[9rem]">
          4<span className="text-gradient-brand">0</span>4
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">You fell out of the map</h1>
        <p className="mt-3 text-muted">This page doesn&apos;t exist — it may have been moved, or the link is broken. Let&apos;s respawn you somewhere safe.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClass("primary", "lg")}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Back home
          </Link>
          <Link href="/games" className={buttonClass("secondary", "lg")}>
            <Gamepad2 className="size-4" aria-hidden="true" /> Browse games
          </Link>
        </div>
      </div>
    </main>
  );
}

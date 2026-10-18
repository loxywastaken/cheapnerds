import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="theme-cartoon relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-24">
      <div className="sunburst pointer-events-none absolute left-1/2 top-[40%] -z-10 size-[140vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow" aria-hidden="true" />
      <div className="max-w-lg text-center">
        <Link href="/" aria-label="Home" className="inline-block rounded-xl">
          <LogoMark className="mx-auto size-20 rounded-2xl" />
        </Link>
        <p className="text-outline-white mt-10 font-display text-[7rem] font-bold leading-none sm:text-[9rem]">
          4<span className="text-outline-gold">0</span>4
        </p>
        <h1 className="mt-6 text-2xl font-bold text-strong sm:text-3xl">You fell out of the map</h1>
        <p className="mt-3 font-medium text-strong/75">This page doesn&apos;t exist. It might have moved, or the link is broken.</p>
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

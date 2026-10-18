"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-32">
      <div className="panel max-w-md p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">An unexpected error occurred while loading this page. Please try again.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-subtle">Reference: {error.digest}</p>}
        <div className="mt-7 flex justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass("primary", "md")}>
            <RotateCcw className="size-4" aria-hidden="true" /> Try again
          </button>
          <Link href="/" className={buttonClass("secondary", "md")}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Sends one anonymous page view per client-side navigation. No cookies are set. */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname || pathname.startsWith("/admin")) return;
    const referrer = last.current === null ? document.referrer : "";
    last.current = pathname;
    const body = JSON.stringify({ path: pathname, referrer: referrer || undefined });
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/analytics", blob)) {
        void fetch("/api/analytics", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
      }
    } catch {}
  }, [pathname]);

  return null;
}

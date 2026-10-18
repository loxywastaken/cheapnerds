import { z } from "zod";
import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { getSettings } from "@/lib/data";
import { hmac } from "@/lib/auth/crypto";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|discordbot|embedly|headless|lighthouse/i;

const payload = z.object({
  path: z.string().min(1).max(300).regex(/^\/[^\s]*$/),
  referrer: z.string().max(500).optional(),
});

/**
 * Privacy-friendly page view counter. No cookies, no raw IPs: visitors are counted with a
 * keyed hash of IP + user agent + date, which rotates daily and can't be reversed.
 */
export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua || BOT_UA.test(ua) || req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") {
      return new Response(null, { status: 204 });
    }
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) return new Response(null, { status: 403 });

    const settings = await getSettings();
    if (!settings.analytics.enabled) return new Response(null, { status: 204 });

    const text = await req.text();
    if (text.length > 2000) return new Response(null, { status: 413 });
    const parsed = payload.safeParse(JSON.parse(text));
    if (!parsed.success) return new Response(null, { status: 400 });

    const { path, referrer } = parsed.data;
    if (path.startsWith("/admin") || path.startsWith("/api")) return new Response(null, { status: 204 });

    let referrerHost: string | null = null;
    if (referrer) {
      try {
        const host = new URL(referrer).hostname.replace(/^www\./, "");
        if (host && host !== req.headers.get("host")?.split(":")[0]) referrerHost = host.slice(0, 100);
      } catch {}
    }

    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const day = new Date().toISOString().slice(0, 10);
    await db.insert(pageViews).values({
      path: path.split("?")[0].slice(0, 200),
      referrerHost,
      visitorHash: hmac(`${day}|${ip}|${ua}`).slice(0, 32),
    });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[analytics]", err);
    return new Response(null, { status: 204 });
  }
}

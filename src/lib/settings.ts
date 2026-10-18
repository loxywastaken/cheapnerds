import { z } from "zod";
import { FEATURE_ICONS } from "./constants";

const optionalUrl = z.union([z.literal(""), z.url({ protocol: /^https?$/ })]).default("");
const optionalMediaUrl = z
  .union([z.literal(""), z.string().regex(/^\/(api\/media\/[0-9a-f-]{36}|brand\/[\w.-]+)$/), z.url({ protocol: /^https$/ })])
  .default("");

const feature = z.object({
  icon: z.enum(FEATURE_ICONS).default("sparkles"),
  title: z.string().trim().min(1).max(60),
  body: z.string().trim().max(240).default(""),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(60).default("Cheap Nerds"),
  siteDescription: z
    .string()
    .trim()
    .max(300)
    .default("Cheap Nerds is a Roblox game studio and community. We create games, build experiences, and bring ideas to life."),
  hero: z
    .object({
      eyebrow: z.string().trim().max(60).default("Roblox game studio & community"),
      title: z.string().trim().min(1).max(80).default("Welcome to Cheap Nerds"),
      subtitle: z.string().trim().max(240).default("We create games, build experiences, and bring ideas to life."),
      featuredGameId: z.string().default(""),
    })
    .prefault({}),
  about: z
    .object({
      title: z.string().trim().max(80).default("A small studio with big ideas"),
      body: z
        .string()
        .trim()
        .max(800)
        .default(
          "Cheap Nerds is a group of Roblox developers who build the games we want to play. We design, script, model and ship everything ourselves, and we build it in the open with our community.",
        ),
    })
    .prefault({}),
  roblox: z
    .object({
      groupId: z.string().regex(/^\d*$/, "Group ID must be numeric").default("35038695"),
      groupUrl: optionalUrl.default("https://www.roblox.com/communities/35038695/Cheap-Nerds-Group"),
      descriptionOverride: z.string().trim().max(1000).default(""),
      bannerUrl: optionalMediaUrl,
      reasons: z.array(feature).max(8).default([
        { icon: "gamepad", title: "Early access", body: "Group members are first in line for playtests of new games and updates." },
        { icon: "gift", title: "Member perks", body: "Exclusive in-game rewards and group-only items across our games." },
        { icon: "megaphone", title: "Stay in the loop", body: "Group shouts announce releases, events and updates the moment they go live." },
        { icon: "heart", title: "Support the studio", body: "Joining helps us grow and keep building the games you love." },
      ]),
    })
    .prefault({}),
  discord: z
    .object({
      inviteUrl: optionalUrl.default("https://discord.gg/MPmd3mDUbE"),
      rulesUrl: optionalUrl,
      description: z
        .string()
        .trim()
        .max(600)
        .default("Hang out with the team and other players, share feedback, get sneak peeks and take part in events."),
      benefits: z.array(feature).max(8).default([
        { icon: "flask", title: "Sneak peeks", body: "See work-in-progress builds and features before anyone else." },
        { icon: "message", title: "Talk to the devs", body: "Share ideas and feedback directly with the people making the games." },
        { icon: "calendar", title: "Community events", body: "Join game nights, giveaways and update launch events." },
        { icon: "shield", title: "Friendly & moderated", body: "A welcoming space with clear rules and active moderation." },
      ]),
    })
    .prefault({}),
  socials: z
    .object({
      youtube: optionalUrl,
      x: optionalUrl,
      tiktok: optionalUrl,
      github: optionalUrl,
    })
    .prefault({}),
  branding: z
    .object({
      logoUrl: optionalMediaUrl,
    })
    .prefault({}),
  announcement: z
    .object({
      enabled: z.boolean().default(false),
      text: z.string().trim().max(140).default(""),
      href: z.string().trim().max(300).default(""),
    })
    .prefault({}),
  analytics: z
    .object({
      enabled: z.boolean().default(true),
    })
    .prefault({}),
});

export type SiteSettings = z.infer<typeof settingsSchema>;
export type FeatureItem = z.infer<typeof feature>;

export const DEFAULT_SETTINGS: SiteSettings = settingsSchema.parse({});

/** Parse stored settings, falling back to defaults for anything missing or invalid. */
export function parseSettings(value: unknown): SiteSettings {
  const result = settingsSchema.safeParse(value ?? {});
  if (result.success) return result.data;
  // Merge field-by-field so one bad value doesn't wipe the rest.
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      const shape = settingsSchema.shape[key as keyof typeof settingsSchema.shape];
      if (!shape) continue;
      const parsed = shape.safeParse(v);
      if (parsed.success) merged[key] = parsed.data;
    }
  }
  return merged as SiteSettings;
}

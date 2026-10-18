import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url({ protocol: /^https?$/ })]).default("");
const optionalMediaUrl = z
  .union([z.literal(""), z.string().regex(/^\/(api\/media\/[0-9a-f-]{36}|brand\/[\w.-]+)$/), z.url({ protocol: /^https$/ })])
  .default("");

const feature = z.object({
  title: z.string().trim().min(1, "Required").max(80),
  body: z.string().trim().max(240).default(""),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(60).default("Cheap Nerds"),
  siteDescription: z
    .string()
    .trim()
    .max(300)
    .default("Cheap Nerds is a Roblox game studio and community. We make games, build experiences and bring ideas to life."),
  hero: z
    .object({
      title: z.string().trim().min(1).max(80).default("Welcome to Cheap Nerds"),
      subtitle: z.string().trim().max(240).default("We create games, build experiences, and bring ideas to life."),
      featuredGameId: z.string().default(""),
    })
    .prefault({}),
  about: z
    .object({
      title: z.string().trim().max(80).default("Who we are"),
      body: z
        .string()
        .trim()
        .max(800)
        .default(
          "We're a small group of Roblox devs making the games we'd want to play ourselves. Scripting, building, modelling and UI all happen in-house, and most of it gets tested by people in our Discord first.",
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
        { title: "Get into playtests early", body: "" },
        { title: "Group-only rewards in our games", body: "" },
        { title: "Shouts when new stuff drops", body: "" },
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
        .default("Talk to the devs, post ideas and bug reports, and see what we're working on before it's out."),
      benefits: z.array(feature).max(8).default([
        { title: "Sneak peeks of stuff in progress", body: "" },
        { title: "Game nights and giveaways", body: "" },
        { title: "A chill, moderated server", body: "" },
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

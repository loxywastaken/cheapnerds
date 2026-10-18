/**
 * Seeds the database with the real Cheap Nerds links plus clearly-labelled sample content.
 * Safe to run more than once: each table is only seeded while it is empty.
 *
 *   npm run db:seed
 */
import { count } from "drizzle-orm";
import { scriptDb } from "./db";

async function main() {
  const { db, close, schema } = scriptDb();
  try {
    const [{ n: settingsCount }] = await db.select({ n: count() }).from(schema.settings);
    if (settingsCount === 0) {
      // Empty object: every field falls back to the defaults in src/lib/settings.ts,
      // which already point at the official group, game and Discord invite.
      await db.insert(schema.settings).values({ key: "site", value: {} });
      console.log("✓ Site settings created");
    }

    const [{ n: gameCount }] = await db.select({ n: count() }).from(schema.games);
    let petMastersId: string | undefined;
    if (gameCount === 0) {
      const [game] = await db
        .insert(schema.games)
        .values({
          slug: "pet-masters-ultimate",
          name: "Pet Masters Ultimate",
          tagline: "Click, hatch and collect adorable pets on your way to becoming the ultimate pet master.",
          // Left empty on purpose: the live description is pulled from Roblox until you write one.
          description: "",
          placeId: "136197477499761",
          status: "released",
          platforms: ["pc", "mobile", "tablet", "console"],
          genre: "Simulator",
          featured: true,
          sortOrder: 0,
        })
        .returning({ id: schema.games.id });
      petMastersId = game.id;
      console.log("✓ Added Pet Masters Ultimate (Roblox data loads live)");
    }

    const [{ n: projectCount }] = await db.select({ n: count() }).from(schema.projects);
    if (projectCount === 0) {
      await db.insert(schema.projects).values([
        {
          slug: "pet-masters-ultimate",
          title: "Pet Masters Ultimate",
          summary: "A pet-collecting clicker simulator built end to end by the Cheap Nerds team.",
          description:
            "## Overview\n\nPet Masters Ultimate is our pet-collecting simulator on Roblox. Players click to earn, hatch eggs and build a team of pets.\n\n_This project write-up is sample text — edit it in the admin panel to tell the real story of how the game was made._",
          category: "game",
          status: "completed",
          technologies: ["Luau", "Roblox Studio", "Blender"],
          externalUrl: "https://www.roblox.com/games/136197477499761/Pet-Masters-Ultimate",
          featured: true,
          sortOrder: 0,
        },
        {
          slug: "cheap-nerds-website",
          title: "Cheap Nerds website",
          summary: "This site: a studio portfolio and community hub with a custom admin dashboard.",
          description:
            "## What it does\n\n- Pulls live game data, icons and thumbnails from the Roblox API\n- Shows real group and Discord member counts\n- Lets the team manage games, projects and news from a secure dashboard\n\n## Stack\n\nNext.js, React, TypeScript, Tailwind CSS, Motion and PostgreSQL.",
          category: "web",
          status: "completed",
          technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
          sortOrder: 1,
        },
      ]);
      console.log("✓ Added sample portfolio projects");
    }

    const [{ n: postCount }] = await db.select({ n: count() }).from(schema.posts);
    if (postCount === 0) {
      const now = Date.now();
      await db.insert(schema.posts).values([
        {
          slug: "welcome-to-the-new-website",
          title: "Welcome to the new Cheap Nerds website",
          excerpt: "Our new home on the web: every game, project and update in one place.",
          body:
            "We've launched a brand new website for Cheap Nerds!\n\nHere you can:\n\n- **Discover and play** all of our Roblox games\n- **Explore our work**, from games to UI and models\n- **Read the latest updates**, patch notes and dev progress\n- **Join the community** in our Roblox group and Discord server\n\nThanks for being part of the journey. 💜",
          category: "community",
          pinned: true,
          publishedAt: new Date(now),
        },
        {
          slug: "sample-game-update-post",
          title: "Sample: how a game update post looks",
          excerpt: "This is sample content. Edit or delete it from the admin dashboard.",
          body:
            "> This is a **sample post** created by the seed script. Replace it with your own update.\n\n## What's new\n\n- New pets and eggs\n- Quality-of-life improvements\n- Bug fixes\n\n## Formatting\n\nPosts support Markdown: **bold**, _italics_, [links](https://www.roblox.com), lists, quotes, tables and images.",
          category: "update",
          gameId: petMastersId ?? null,
          publishedAt: new Date(now - 1000 * 60 * 60 * 24 * 3),
        },
      ]);
      console.log("✓ Added sample news posts");
    }
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

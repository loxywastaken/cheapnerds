# Cheap Nerds

The website for **Cheap Nerds**, a Roblox game studio and community. It's a portfolio, game showcase and community hub, with a private admin dashboard for managing everything without touching code.

- **Public site:** home, games (with search and status filters), game detail pages (gallery, live Roblox stats, update log), portfolio, news, and a community page for the Roblox group and Discord.
- **Live data:** game names, icons, thumbnails, player counts, visits and last-updated dates come straight from the Roblox API. Group info and member count come from Roblox, and the Discord server name, icon and member/online counts come from Discord's invite API. When an API is unreachable, the site falls back to what's stored in the database. It never shows made-up numbers.
- **Admin dashboard** at `/admin`: games (import straight from a Roblox link or from your group), update logs, projects, news posts with Markdown and image uploads, a media library, site settings (homepage text, group/Discord links, branding, socials, announcement bar), privacy-friendly analytics, and admin accounts.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lucide · PostgreSQL with Drizzle ORM · bcrypt + database-backed sessions.

## Getting started

Requirements: Node.js 20.12+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env.local        # then fill in DATABASE_URL and APP_SECRET
npm run db:migrate                # create tables
npm run db:seed                   # official links + Pet Masters Ultimate + sample posts/projects
npm run admin:create -- --email you@example.com --name "Your Name"
npm run dev
```

Open http://localhost:3000, and sign in at http://localhost:3000/admin.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string. On serverless hosts, use the **pooled** URL. |
| `APP_SECRET` | ✅ | Long random string (`openssl rand -base64 48`). Salts the anonymous analytics hashes and login rate-limit keys. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL, e.g. `https://cheapnerds.com`. Used for canonical URLs, the sitemap and Open Graph images. |
| `DATABASE_SSL` | | Set to `true` if your database needs SSL and the URL has no `sslmode` parameter. |

The Roblox and Discord integrations use public endpoints, so no API keys are needed.

## Deploying to Vercel

1. Create a Postgres database (Neon, Supabase or Vercel Postgres all work) and copy its **pooled** connection string.
2. Import the repo into Vercel and add the environment variables above for **Production, Preview and Build**. Public pages are prerendered from the database at build time, so the build needs `DATABASE_URL`.
3. Deploy. The `vercel-build` script runs database migrations before `next build`.
4. Seed and create your first admin once, from your machine, with `DATABASE_URL` pointing at the production database:
   ```bash
   npm run db:seed
   npm run admin:create -- --email you@example.com --name "Your Name"
   ```

To self-host instead, run `npm run db:migrate && npm run build && npm start` behind a reverse proxy that sets `X-Forwarded-For`.

## Managing content

Everything below is in `/admin`:

- **Games → Add game:** paste a Roblox game link and the game's name, icon, thumbnails and stats are pulled in automatically. Public games owned by your group are listed for one-click import. Each game has a status (Released / In Development / Coming Soon), platforms, featured/published switches, optional image overrides, extra screenshots and an update log.
- **Projects:** portfolio entries with category, status, technologies, cover and gallery images, and an external link.
- **News:** Markdown posts with a cover image, category, optional related game, pinning, drafts and a publish date. There's an RSS feed at `/updates/rss.xml`.
- **Media:** every uploaded image (PNG, JPEG, WebP, GIF or AVIF, up to 4 MB). Images are stored in Postgres, so they survive redeploys on serverless hosts. Images that are still in use can't be deleted.
- **Site settings:** homepage hero and studio text, the hero's featured game, logo upload, Roblox group ID/link/banner/"reasons to join", Discord invite/rules/description/benefits, social links, announcement bar and analytics on/off.
- **Account:** change your password, sign out other devices, and (as an owner) add or remove admins.

Changes show up on the public site immediately, because each save invalidates the matching cache tags. Roblox and Discord data refreshes every minute or so. "Refresh" on the dashboard forces an immediate refresh.

> Use a **permanent** Discord invite (Server Settings → Invites → never expire), or the member counts and Join buttons will break when it expires.

## Security notes

- Passwords are hashed with bcrypt (cost 12). Sessions are random 256-bit tokens stored as SHA-256 hashes, in `httpOnly`, `SameSite=Lax` cookies (`Secure` in production) that expire after 7 days of inactivity.
- Every admin page **and** every Server Action checks the session on the server. The proxy redirect is only a fast path.
- Login is rate-limited per email and per IP in the database, so the limit holds across serverless instances.
- Uploads are checked by their actual bytes, not their extension, and SVG is rejected. Media is served with `nosniff` and a sandboxing CSP.
- Markdown is rendered without raw HTML. Links are limited to http(s)/mailto/relative, and images to uploaded media or the Roblox CDN.
- Analytics stores no cookies, no IPs and no personal data. Visitors are counted with a keyed hash that rotates daily, and Do Not Track / Global Privacy Control are respected.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:generate` | Generate a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed empty tables with starter content |
| `npm run db:studio` | Browse the database with Drizzle Studio |
| `npm run admin:create` | Create an admin, or reset an existing admin's password |

## Project structure

```
src/
  app/(site)/        public pages (home, games, work, updates, community)
  app/admin/         login, dashboard pages and Server Actions
  app/api/           media serving and analytics beacon
  components/site/   public UI (header, cards, hero, gallery, community promos)
  components/admin/  admin UI (forms, uploads, toasts)
  components/ui/     shared primitives
  db/                Drizzle schema and client
  lib/               data access, Roblox/Discord integrations, auth, settings
scripts/             migrate, seed, create-admin
drizzle/             SQL migrations
```

Fonts in `src/assets/fonts` (Geist and Fredoka) are used for Open Graph images and are licensed under the SIL Open Font License. The logo lives in `public/brand/logo.png` and also generates the favicon (`src/app/icon.png`, `src/app/apple-icon.png`).

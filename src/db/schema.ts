import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const adminRole = pgEnum("admin_role", ["owner", "admin"]);
export const gameStatus = pgEnum("game_status", ["released", "in_development", "coming_soon"]);
export const projectCategory = pgEnum("project_category", ["game", "ui", "models", "web", "experimental"]);
export const projectStatus = pgEnum("project_status", ["completed", "in_progress", "upcoming"]);
export const postCategory = pgEnum("post_category", [
  "release",
  "update",
  "devlog",
  "community",
  "event",
  "teaser",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("admin"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("admins_email_idx").on(sql`lower(${t.email})`)]);

export const sessions = pgTable("sessions", {
  // SHA-256 of the session token. The raw token only ever lives in the user's cookie.
  id: text("id").primaryKey(),
  adminId: uuid("admin_id").notNull().references(() => admins.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sessions_admin_idx").on(t.adminId)]);

export const loginAttempts = pgTable("login_attempts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ipHash: text("ip_hash").notNull(),
  email: text("email").notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("login_attempts_ip_idx").on(t.ipHash, t.createdAt),
  index("login_attempts_email_idx").on(t.email, t.createdAt),
]);

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  data: bytea("data").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => admins.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  placeId: text("place_id"),
  universeId: text("universe_id"),
  status: gameStatus("status").notNull().default("in_development"),
  platforms: text("platforms").array().notNull().default(sql`'{}'::text[]`),
  genre: text("genre").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  showStats: boolean("show_stats").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  // Optional overrides. When empty, the live Roblox icon / thumbnails are used.
  iconUrl: text("icon_url"),
  thumbnailUrl: text("thumbnail_url"),
  screenshots: text("screenshots").array().notNull().default(sql`'{}'::text[]`),
  releaseDate: timestamp("release_date", { withTimezone: true }),
  ...timestamps,
});

export const gameUpdates = pgTable("game_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  version: text("version").notNull().default(""),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("game_updates_game_idx").on(t.gameId, t.publishedAt)]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  category: projectCategory("category").notNull().default("game"),
  status: projectStatus("status").notNull().default("in_progress"),
  technologies: text("technologies").array().notNull().default(sql`'{}'::text[]`),
  coverUrl: text("cover_url"),
  gallery: text("gallery").array().notNull().default(sql`'{}'::text[]`),
  externalUrl: text("external_url"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  coverUrl: text("cover_url"),
  category: postCategory("category").notNull().default("update"),
  gameId: uuid("game_id").references(() => games.id, { onDelete: "set null" }),
  pinned: boolean("pinned").notNull().default(false),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  ...timestamps,
}, (t) => [index("posts_published_idx").on(t.published, t.publishedAt)]);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  path: text("path").notNull(),
  referrerHost: text("referrer_host"),
  visitorHash: text("visitor_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("page_views_created_idx").on(t.createdAt)]);

export type Game = typeof games.$inferSelect;
export type GameUpdate = typeof gameUpdates.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Admin = typeof admins.$inferSelect;

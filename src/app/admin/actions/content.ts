"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { posts, projects } from "@/db/schema";
import {
  bool,
  failure,
  fromZodError,
  handleActionError,
  imageRef,
  list,
  optionalDate,
  optionalHttpUrl,
  optionalImageRef,
  slugSchema,
  str,
  success,
  tags,
  type ActionState,
} from "@/lib/admin/forms";
import { assertAdmin } from "@/lib/auth/session";
import { POST_CATEGORIES, PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/constants";
import { refresh } from "@/lib/revalidate";
import { slugify } from "@/lib/utils";

async function slugTaken(table: typeof projects | typeof posts, slug: string, id?: string) {
  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(id ? and(eq(table.slug, slug), ne(table.id, id)) : eq(table.slug, slug))
    .limit(1);
  return !!row;
}

/* ---------------- Projects ---------------- */

const projectSchema = z.object({
  title: z.string().trim().min(1, "Required").max(100),
  slug: slugSchema,
  summary: z.string().trim().max(240),
  description: z.string().trim().max(20000),
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(PROJECT_STATUSES),
  technologies: z.array(z.string().max(30)).max(20),
  coverUrl: optionalImageRef,
  gallery: z.array(imageRef).max(20, "Up to 20 images"),
  externalUrl: optionalHttpUrl,
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.coerce.number().int().min(-9999).max(9999),
});

export async function saveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  try {
    await assertAdmin();
    const id = str(formData, "id") || undefined;
    const parsed = projectSchema.safeParse({
      title: str(formData, "title"),
      slug: str(formData, "slug") || slugify(str(formData, "title")),
      summary: str(formData, "summary"),
      description: str(formData, "description"),
      category: str(formData, "category"),
      status: str(formData, "status"),
      technologies: tags(formData, "technologies"),
      coverUrl: str(formData, "coverUrl"),
      gallery: list(formData, "gallery"),
      externalUrl: str(formData, "externalUrl"),
      featured: bool(formData, "featured"),
      published: bool(formData, "published"),
      sortOrder: str(formData, "sortOrder") || "0",
    });
    if (!parsed.success) return fromZodError(parsed.error);
    if (await slugTaken(projects, parsed.data.slug, id)) return failure("That URL slug is already used by another project.", { slug: "Already in use" });

    if (id) {
      const result = await db.update(projects).set(parsed.data).where(eq(projects.id, id)).returning({ id: projects.id });
      if (result.length === 0) return failure("This project no longer exists.");
    } else {
      const [row] = await db.insert(projects).values(parsed.data).returning({ id: projects.id });
      createdId = row.id;
    }
    refresh("projects");
    if (!createdId) return success("Project saved.", { slug: parsed.data.slug });
  } catch (err) {
    return handleActionError(err);
  }
  redirect(`/admin/projects/${createdId}?created=1`);
}

export async function deleteProject(id: string): Promise<ActionState> {
  try {
    await assertAdmin();
    await db.delete(projects).where(eq(projects.id, id));
    refresh("projects");
    return success("Project deleted.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function setProjectFlag(id: string, flag: "featured" | "published", value: boolean): Promise<ActionState> {
  try {
    await assertAdmin();
    if ((flag !== "featured" && flag !== "published") || typeof value !== "boolean") return failure("Invalid change.");
    await db.update(projects).set({ [flag]: value }).where(eq(projects.id, id));
    refresh("projects");
    return success("Project updated.");
  } catch (err) {
    return handleActionError(err);
  }
}

/* ---------------- Posts ---------------- */

const postSchema = z.object({
  title: z.string().trim().min(1, "Required").max(140),
  slug: slugSchema,
  excerpt: z.string().trim().max(300),
  body: z.string().trim().min(1, "Write something").max(50000),
  coverUrl: optionalImageRef,
  category: z.enum(POST_CATEGORIES),
  gameId: z.union([z.literal(""), z.uuid()]).transform((v) => v || null),
  pinned: z.boolean(),
  published: z.boolean(),
  publishedAt: optionalDate,
});

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  try {
    await assertAdmin();
    const id = str(formData, "id") || undefined;
    const parsed = postSchema.safeParse({
      title: str(formData, "title"),
      slug: str(formData, "slug") || slugify(str(formData, "title")),
      excerpt: str(formData, "excerpt"),
      body: str(formData, "body"),
      coverUrl: str(formData, "coverUrl"),
      category: str(formData, "category"),
      gameId: str(formData, "gameId"),
      pinned: bool(formData, "pinned"),
      published: bool(formData, "published"),
      publishedAt: str(formData, "publishedAt"),
    });
    if (!parsed.success) return fromZodError(parsed.error);
    if (await slugTaken(posts, parsed.data.slug, id)) return failure("That URL slug is already used by another post.", { slug: "Already in use" });
    const { publishedAt, ...rest } = parsed.data;
    const values = { ...rest, ...(publishedAt ? { publishedAt } : {}) };

    if (id) {
      const result = await db.update(posts).set(values).where(eq(posts.id, id)).returning({ id: posts.id });
      if (result.length === 0) return failure("This post no longer exists.");
    } else {
      const [row] = await db.insert(posts).values(values).returning({ id: posts.id });
      createdId = row.id;
    }
    refresh("posts");
    if (!createdId) return success("Post saved.", { slug: values.slug });
  } catch (err) {
    return handleActionError(err);
  }
  redirect(`/admin/posts/${createdId}?created=1`);
}

export async function deletePost(id: string): Promise<ActionState> {
  try {
    await assertAdmin();
    await db.delete(posts).where(eq(posts.id, id));
    refresh("posts");
    return success("Post deleted.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function setPostFlag(id: string, flag: "pinned" | "published", value: boolean): Promise<ActionState> {
  try {
    await assertAdmin();
    if ((flag !== "pinned" && flag !== "published") || typeof value !== "boolean") return failure("Invalid change.");
    await db.update(posts).set({ [flag]: value }).where(eq(posts.id, id));
    refresh("posts");
    return success("Post updated.");
  } catch (err) {
    return handleActionError(err);
  }
}

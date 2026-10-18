"use client";

import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { savePost } from "@/app/admin/actions/content";
import type { Post } from "@/db/schema";
import { POST_CATEGORIES, POST_CATEGORY_LABELS } from "@/lib/constants";
import { ActionForm } from "./action-form";
import { FormSection, SelectField, SubmitButton, TextField, Toggle } from "./fields";
import { ImageField } from "./image-field";
import { MarkdownField } from "./markdown-field";

function localDateTime(d: Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PostForm({ post, games }: { post?: Post; games: { id: string; name: string }[] }) {
  return (
    <ActionForm action={savePost} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="space-y-6">
        <FormSection title="Post">
          <TextField label="Title" name="title" defaultValue={post?.title} required maxLength={140} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="URL slug" name="slug" defaultValue={post?.slug} placeholder="auto from title" maxLength={80} />
            <SelectField label="Category" name="category" defaultValue={post?.category ?? "update"} options={POST_CATEGORIES.map((c) => ({ value: c, label: POST_CATEGORY_LABELS[c] }))} />
          </div>
          <TextField label="Excerpt" name="excerpt" defaultValue={post?.excerpt} maxLength={300} hint="Shown on cards and link previews." />
          <MarkdownField label="Content" name="body" defaultValue={post?.body} rows={18} />
        </FormSection>
      </div>
      <div className="space-y-6">
        <FormSection title="Publishing">
          <Toggle label="Published" name="published" description="Unpublished posts are drafts." defaultChecked={post?.published ?? true} />
          <Toggle label="Pinned" name="pinned" description="Keep at the top of the news feed." defaultChecked={post?.pinned ?? false} />
          <input type="hidden" name="publishedAt" defaultValue={post ? new Date(post.publishedAt).toISOString() : ""} />
          <PublishedAtField value={localDateTime(post?.publishedAt)} />
          <SelectField label="Related game" name="gameId" defaultValue={post?.gameId ?? ""} options={[{ value: "", label: "None" }, ...games.map((g) => ({ value: g.id, label: g.name }))]} />
        </FormSection>
        <FormSection title="Cover image">
          <ImageField label="Image" name="coverUrl" defaultValue={post?.coverUrl} />
        </FormSection>
        <div className="flex flex-col gap-3 xl:sticky xl:top-6">
          <SubmitButton className="w-full">
            <Save className="size-4" aria-hidden="true" /> {post ? "Save changes" : "Publish post"}
          </SubmitButton>
          {post?.published && (
            <Link href={`/updates/${post.slug}`} target="_blank" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-white">
              View on site <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </ActionForm>
  );
}

/** datetime-local is in the admin's timezone; convert to an ISO string before submitting. */
function PublishedAtField({ value }: { value: string }) {
  return (
    <TextField
      label="Publish date"
      name="publishedAtLocal"
      type="datetime-local"
      defaultValue={value}
      hint="Leave empty to use now."
      onChange={(e) => {
        const hidden = e.currentTarget.form?.elements.namedItem("publishedAt") as HTMLInputElement | null;
        if (hidden) hidden.value = e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : "";
      }}
    />
  );
}

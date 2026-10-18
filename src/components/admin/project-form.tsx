"use client";

import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { saveProject } from "@/app/admin/actions/content";
import type { Project } from "@/db/schema";
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS, PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";
import { ActionForm } from "./action-form";
import { FormSection, SelectField, SubmitButton, TextField, Toggle } from "./fields";
import { GalleryField, ImageField } from "./image-field";
import { MarkdownField } from "./markdown-field";

export function ProjectForm({ project }: { project?: Project }) {
  return (
    <ActionForm action={saveProject} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="space-y-6">
        <FormSection title="Project">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Title" name="title" defaultValue={project?.title} required maxLength={100} />
            <TextField label="URL slug" name="slug" defaultValue={project?.slug} placeholder="auto from title" maxLength={80} />
          </div>
          <TextField label="Summary" name="summary" defaultValue={project?.summary} maxLength={240} hint="Short description for cards." />
          <MarkdownField label="Full description" name="description" defaultValue={project?.description} />
        </FormSection>
        <FormSection title="Images">
          <ImageField label="Cover image" name="coverUrl" defaultValue={project?.coverUrl} />
          <GalleryField label="Preview gallery" name="gallery" defaultValue={project?.gallery ?? []} />
        </FormSection>
      </div>
      <div className="space-y-6">
        <FormSection title="Details">
          <SelectField label="Category" name="category" defaultValue={project?.category ?? "game"} options={PROJECT_CATEGORIES.map((c) => ({ value: c, label: PROJECT_CATEGORY_LABELS[c] }))} />
          <SelectField label="Development status" name="status" defaultValue={project?.status ?? "in_progress"} options={PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }))} />
          <TextField label="Technologies" name="technologies" defaultValue={project?.technologies.join(", ")} placeholder="Luau, Blender, Figma" hint="Comma separated." />
          <TextField label="External link" name="externalUrl" type="url" defaultValue={project?.externalUrl ?? ""} placeholder="https://…" />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} />
          <Toggle label="Published" name="published" defaultChecked={project?.published ?? true} />
          <Toggle label="Featured" name="featured" defaultChecked={project?.featured ?? false} />
        </FormSection>
        <div className="flex flex-col gap-3 xl:sticky xl:top-6">
          <SubmitButton className="w-full">
            <Save className="size-4" aria-hidden="true" /> {project ? "Save changes" : "Create project"}
          </SubmitButton>
          {project?.published && (
            <Link href={`/work/${project.slug}`} target="_blank" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-white">
              View on site <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </ActionForm>
  );
}

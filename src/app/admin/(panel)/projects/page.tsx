import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionButton, ActionSwitch } from "@/components/admin/action-button";
import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectStatusBadge } from "@/components/ui/badges";
import { buttonClass } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { PROJECT_CATEGORY_LABELS } from "@/lib/constants";
import { deleteProject, setProjectFlag } from "../../actions/content";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  await requireAdmin();
  const rows = await db.select().from(projects).orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
  return (
    <>
      <AdminPageTitle
        title="Projects"
        description="Your portfolio: games, UI, models, websites and experiments."
        actions={
          <Link href="/admin/projects/new" className={buttonClass("accent", "sm")}>
            <Plus className="size-4" aria-hidden="true" /> New project
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={Boxes} title="No projects yet">
          <Link href="/admin/projects/new" className="text-brand-soft hover:text-white">
            Add your first project →
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <li key={p.id} className="panel overflow-hidden">
              <div className="relative aspect-video bg-surface-2">
                <CoverImage src={p.coverUrl} alt="" sizes="360px" fallbackIcon={Boxes} zoom={false} />
                <ProjectStatusBadge status={p.status} className="absolute left-3 top-3 bg-ink/60" />
              </div>
              <div className="p-4">
                <p className="text-xs text-subtle">{PROJECT_CATEGORY_LABELS[p.category]}</p>
                <Link href={`/admin/projects/${p.id}`} className="mt-0.5 block truncate font-medium text-white hover:underline">
                  {p.title}
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-2">
                      <ActionSwitch checked={p.published} onChange={setProjectFlag.bind(null, p.id, "published")} label={`Published: ${p.title}`} /> Live
                    </span>
                    <span className="flex items-center gap-2">
                      <ActionSwitch checked={p.featured} onChange={setProjectFlag.bind(null, p.id, "featured")} label={`Featured: ${p.title}`} /> Featured
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/projects/${p.id}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/10 hover:text-white" aria-label={`Edit ${p.title}`}>
                      <Pencil className="size-4" />
                    </Link>
                    <ActionButton
                      action={deleteProject.bind(null, p.id)}
                      confirm={`Delete “${p.title}”? This can't be undone.`}
                      title={`Delete ${p.title}`}
                      className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </ActionButton>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

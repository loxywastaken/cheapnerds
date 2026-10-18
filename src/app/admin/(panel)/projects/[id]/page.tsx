import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectForm } from "@/components/admin/project-form";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!project) notFound();
  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" /> Projects
      </Link>
      <AdminPageTitle title={project.title} description={project.published ? "Published" : "Draft"} />
      <ProjectForm project={project} />
    </>
  );
}

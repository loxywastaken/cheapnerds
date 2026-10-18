import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" /> Projects
      </Link>
      <AdminPageTitle title="New project" />
      <ProjectForm />
    </>
  );
}

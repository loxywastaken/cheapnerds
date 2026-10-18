import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Gallery } from "@/components/site/gallery";
import { ProjectStatusBadge } from "@/components/ui/badges";
import { buttonClass } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";
import { ArticleSkeleton } from "@/components/ui/detail-skeleton";
import { Markdown } from "@/components/ui/markdown";
import { PROJECT_CATEGORY_LABELS } from "@/lib/constants";
import { getProject, getProjects } from "@/lib/data";
import { formatDate, plainText, safeExternalUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  const description = project.summary || plainText(project.description, 160);
  return {
    title: project.title,
    description,
    openGraph: { title: project.title, description, images: project.coverUrl ? [project.coverUrl] : undefined },
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: Pick<PageProps<"/work/[slug]">, "params">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const externalUrl = safeExternalUrl(project.externalUrl);
  const images = [...new Set([project.coverUrl, ...project.gallery].filter((x): x is string => !!x))];

  return (
    <article className="container-page max-w-5xl pt-28 sm:pt-36">
      <Link href="/work" className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-strong/80 transition-colors hover:text-strong">
        <ArrowLeft className="size-4" aria-hidden="true" /> All work
      </Link>
      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display font-semibold text-strong/70">{PROJECT_CATEGORY_LABELS[project.category]}</span>
          <ProjectStatusBadge status={project.status} />
        </div>
        <h1 className="text-outline-white mt-4 text-4xl font-bold leading-[1.05] sm:text-6xl">{project.title}</h1>
        {project.summary && <p className="mt-4 max-w-3xl text-lg text-muted sm:text-xl">{project.summary}</p>}
      </header>

      <div className="mt-10">
        {images.length > 1 ? (
          <Gallery images={images} title={project.title} />
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-3xl border-[3px] border-outline bg-surface-2 shadow-[0_6px_0_var(--color-outline)]">
            <CoverImage src={images[0]} alt={project.title} sizes="(min-width: 1024px) 1024px, 100vw" preload zoom={false} seed={project.slug} />
          </div>
        )}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_17rem]">
        <div>{project.description ? <Markdown>{project.description}</Markdown> : <p className="text-muted">More details soon.</p>}</div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {project.technologies.length > 0 && (
            <div className="panel p-5">
              <h2 className="text-xs text-subtle">Built with</h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li key={tech} className="rounded-lg border border-line bg-tint/[0.03] px-2.5 py-1 font-mono text-xs text-fg">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="panel p-5 text-sm">
            <p className="text-xs text-subtle">Last updated</p>
            <p className="mt-1 text-fg">{formatDate(project.updatedAt)}</p>
          </div>
          {externalUrl && (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md", "w-full")}>
              View project <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          )}
        </aside>
      </div>
    </article>
  );
}

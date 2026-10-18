import Link from "next/link";
import { ArrowUpRight, Boxes } from "lucide-react";
import { ProjectStatusBadge } from "@/components/ui/badges";
import { CoverImage } from "@/components/ui/cover-image";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Project } from "@/db/schema";
import { PROJECT_CATEGORY_LABELS } from "@/lib/constants";

export function ProjectCard({ project }: { project: Pick<Project, "slug" | "title" | "summary" | "category" | "status" | "technologies" | "coverUrl"> }) {
  return (
    <SpotlightCard className="group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <CoverImage src={project.coverUrl} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" fallbackIcon={Boxes} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
        <ProjectStatusBadge status={project.status} className="absolute left-3 top-3 bg-ink/60" />
        <span className="absolute bottom-3 right-3 grid size-9 translate-y-2 place-items-center rounded-full bg-white text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow !text-[0.66rem] !text-subtle">{PROJECT_CATEGORY_LABELS[project.category]}</p>
        <h3 className="mt-2 text-lg font-semibold text-white">
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
            {project.title}
          </Link>
        </h3>
        {project.summary && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{project.summary}</p>}
        {project.technologies.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {project.technologies.slice(0, 4).map((tech) => (
              <li key={tech} className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[0.7rem] text-muted">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SpotlightCard>
  );
}

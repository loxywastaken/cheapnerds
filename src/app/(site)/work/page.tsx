import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { FilterableGrid } from "@/components/site/filterable-grid";
import { ProjectCard } from "@/components/site/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/section-heading";
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS } from "@/lib/constants";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Work",
  description: "A portfolio of Cheap Nerds projects: Roblox games, UI design, models and assets, websites and experiments.",
};

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Our work"
        description="Games, interfaces, models, tools and experiments — everything the studio has designed and built."
      />
      <div className="container-page pt-14">
        {projects.length === 0 ? (
          <EmptyState icon={Boxes} title="Portfolio coming soon">
            We&apos;re putting together a showcase of our projects.
          </EmptyState>
        ) : (
          <FilterableGrid
            searchPlaceholder="Search projects or tech…"
            emptyLabel="No projects match that search."
            filters={PROJECT_CATEGORIES.map((c) => ({ value: c, label: PROJECT_CATEGORY_LABELS[c] }))}
            items={projects.map((project) => ({
              id: project.id,
              filter: project.category,
              searchText: [project.title, project.summary, ...project.technologies].join(" "),
              node: <ProjectCard project={project} />,
            }))}
          />
        )}
      </div>
    </>
  );
}

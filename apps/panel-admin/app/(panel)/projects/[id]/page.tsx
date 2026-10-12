import { notFound } from "next/navigation";
import { ProjectDetailView } from "@features/projects/components/ProjectDetailView";
import { ProjectStatusBadge } from "@features/projects/components/ProjectStatusBadge";
import { getProjectById } from "@features/projects/infrastructure/repositories/projectRepository";
import {
  PageBackLink,
  PageHeader,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@shared/ui/patterns/PageHeader";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageBackLink href="/projects">Proyectos</PageBackLink>
        <div className="flex items-center gap-3">
          <PageHeaderTitle>{project.name}</PageHeaderTitle>
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.oneLiner && <PageHeaderDescription>{project.oneLiner}</PageHeaderDescription>}
      </PageHeader>
      <ProjectDetailView project={project} />
    </section>
  );
}

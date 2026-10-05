import type { Metadata } from "next";
import { ProjectSearch } from "@features/projects/components/ProjectSearch";
import { ProjectsTable } from "@features/projects/components/ProjectsTable";
import { listProjects } from "@features/projects/infrastructure/repositories/projectRepository";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = { title: "Proyectos" };

interface Props {
  searchParams: Promise<{ s?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { s } = await searchParams;
  const projects = await listProjects({ s });

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderTitle>Proyectos</PageHeaderTitle>
        <PageHeaderDescription>
          Ecosistema de proyectos, independiente de las simulaciones.
        </PageHeaderDescription>
      </PageHeader>
      <ProjectSearch defaultValue={s} />
      <ProjectsTable projects={projects} filtered={Boolean(s)} />
    </section>
  );
}

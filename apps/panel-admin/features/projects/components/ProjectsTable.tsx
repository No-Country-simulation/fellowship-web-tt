import Link from "next/link";
import { formatShortDate } from "@shared/lib/formatDate";
import { Cell, DataTable } from "@shared/ui/patterns/DataTable";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import type { Project } from "../types/project";

export function ProjectsTable({ projects, filtered }: { projects: Project[]; filtered: boolean }) {
  return (
    <DataTable
      caption="Proyectos"
      columns={["Proyecto", "Empresa", "Vertical", "Estado", "Creado"]}
      isEmpty={projects.length === 0}
      // El vacío distingue "no hay datos" de "la búsqueda no encontró nada".
      emptyMessage={filtered ? "La búsqueda no encontró proyectos." : "Todavía no hay proyectos."}
    >
      {projects.map((project) => (
        <tr key={project.id} className="hover:bg-muted/50">
          <Cell>
            <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
              {project.name}
            </Link>
            {project.oneLiner && (
              <span className="block text-admin-caption text-muted-foreground">{project.oneLiner}</span>
            )}
          </Cell>
          <Cell className="text-muted-foreground">{project.companyName ?? "—"}</Cell>
          <Cell className="text-muted-foreground">{project.verticals.join(", ")}</Cell>
          <Cell>
            <ProjectStatusBadge status={project.status} />
          </Cell>
          <Cell className="text-muted-foreground">{formatShortDate(project.createdAt)}</Cell>
        </tr>
      ))}
    </DataTable>
  );
}

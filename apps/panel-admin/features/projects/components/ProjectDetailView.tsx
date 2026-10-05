import { formatShortDate } from "@shared/lib/formatDate";
import { SectionCard } from "@shared/ui/patterns/SectionCard";
import type { Project } from "../types/project";

export function ProjectDetailView({ project }: { project: Project }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <SectionCard title="Descripción">
        <p className="text-admin-body text-muted-foreground">
          {project.description ?? "El proyecto no tiene descripción cargada."}
        </p>
      </SectionCard>

      <SectionCard title="Datos">
        <dl className="space-y-3 text-admin-body">
          <div>
            <dt className="text-admin-caption text-muted-foreground">Empresa</dt>
            <dd>{project.companyName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-admin-caption text-muted-foreground">Vertical</dt>
            <dd>{project.verticals.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-admin-caption text-muted-foreground">Roles esperados</dt>
            <dd>{project.expectedRoles.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-admin-caption text-muted-foreground">Creado</dt>
            <dd>{formatShortDate(project.createdAt)}</dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  );
}

import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";
import type { ProjectStatus } from "../types/project";

const STATUS: Record<ProjectStatus, { label: string; tone: VisualTone }> = {
  ASSIGNED: { label: "Asignado", tone: "success" },
  NOT_ASSIGNED: { label: "Sin asignar", tone: "neutral" },
  IN_REVISION: { label: "En revisión", tone: "warning" },
  ACCEPTED: { label: "Aceptado", tone: "info" },
  REJECTED: { label: "Rechazado", tone: "destructive" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { label, tone } = STATUS[status];
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

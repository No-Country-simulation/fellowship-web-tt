import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";
import type { SimulationStatus } from "../types/simulation";

const STATUS: Record<SimulationStatus, { label: string; tone: VisualTone }> = {
  ACTIVE: { label: "En curso", tone: "success" },
  INSCRIPTION: { label: "Inscripción", tone: "info" },
  INCOMING: { label: "Próxima", tone: "warning" },
  CLOSED: { label: "Cerrada", tone: "neutral" },
};

export function SimulationStatusBadge({ status }: { status: SimulationStatus }) {
  const { label, tone } = STATUS[status];
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

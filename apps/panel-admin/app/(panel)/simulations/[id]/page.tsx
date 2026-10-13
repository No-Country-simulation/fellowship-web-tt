import { notFound } from "next/navigation";
import { getSimulationById } from "@features/simulations/infrastructure/repositories/simulationRepository";
import { formatShortDate } from "@shared/lib/formatDate";
import { MetricCard } from "@shared/ui/patterns/MetricCard";

export default async function SimulationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const simulation = await getSimulationById(id);
  if (!simulation) notFound();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Talentos" value={simulation.talentsCount} />
      <MetricCard label="Equipos" value={simulation.teamsCount} />
      <MetricCard label="Inicio" value={formatShortDate(simulation.startDate)} />
      <MetricCard label="Cierre" value={formatShortDate(simulation.endDate)} />
    </div>
  );
}

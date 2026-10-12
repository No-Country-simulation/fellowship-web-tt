import { TeamsTable } from "@features/simulations/components/TeamsTable";
import { listSimulationTeams } from "@features/simulations/infrastructure/repositories/simulationRepository";

export default async function SimulationTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teams = await listSimulationTeams(id);

  return <TeamsTable teams={teams} />;
}

import { mockResponse } from "@core/api/mockClient";
import { SIMULATIONS_MOCK, TEAMS_MOCK } from "../mocks/simulations.mock";
import type { SimTeam, Simulation, SimulationStatus } from "../../types/simulation";

// Real: GET /admin/simulations?status=…
export async function listSimulations(query: { status?: SimulationStatus } = {}): Promise<Simulation[]> {
  const items = query.status
    ? SIMULATIONS_MOCK.filter((simulation) => simulation.status === query.status)
    : SIMULATIONS_MOCK;
  return mockResponse(items);
}

// Real: GET /admin/simulations/:id
export async function getSimulationById(id: string): Promise<Simulation | null> {
  return mockResponse(SIMULATIONS_MOCK.find((simulation) => simulation.id === id) ?? null);
}

// Real: GET /admin/simulations/:id/teams
export async function listSimulationTeams(simulationId: string): Promise<SimTeam[]> {
  return mockResponse(TEAMS_MOCK.filter((team) => team.simulationId === simulationId));
}

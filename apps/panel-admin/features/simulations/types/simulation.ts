export type SimulationStatus = "ACTIVE" | "INSCRIPTION" | "INCOMING" | "CLOSED";
export type SimulationType = "OPEN" | "CLOSED";

export interface Simulation {
  id: string;
  name: string;
  code: string | null;
  status: SimulationStatus;
  type: SimulationType;
  isPremium: boolean;
  startDate: string;
  endDate: string;
  talentsCount: number;
  teamsCount: number;
}

export interface SimTeam {
  id: string;
  simulationId: string;
  name: string;
  vertical: string;
  project: string | null;
  members: number;
  /** 0–100: avance de entregables. */
  progress: number;
}

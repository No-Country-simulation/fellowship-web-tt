export interface AppStats {
  activeSimulations: number;
  enrolledTalents: number;
  activeTeams: number;
  projects: number;
  /** Talentos por vertical, para el gráfico de distribución. */
  byVertical: { vertical: string; talents: number }[];
}

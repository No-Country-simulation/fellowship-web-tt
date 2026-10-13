import type { AppStats } from "../../types/appStats";

export const APP_STATS_MOCK: AppStats = {
  activeSimulations: 3,
  enrolledTalents: 412,
  activeTeams: 58,
  projects: 27,
  byVertical: [
    { vertical: "Web App", talents: 168 },
    { vertical: "Data", talents: 74 },
    { vertical: "Mobile", talents: 61 },
    { vertical: "No-Code", talents: 52 },
    { vertical: "IA", talents: 57 },
  ],
};

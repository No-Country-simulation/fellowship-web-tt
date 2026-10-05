import { mockResponse } from "@core/api/mockClient";
import { APP_STATS_MOCK } from "../mocks/appStats.mock";
import type { AppStats } from "../../types/appStats";

// Real: GET /admin/app-stats → AppStatsMapper.fromDto(res.data)
export async function getCurrentAppStats(): Promise<AppStats> {
  return mockResponse(APP_STATS_MOCK);
}

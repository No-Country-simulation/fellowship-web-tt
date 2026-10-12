import { mockResponse } from "@core/api/mockClient";
import { TALENTS_MOCK } from "../mocks/talents.mock";
import type { Talent } from "../../types/talent";

// Real: GET /admin/staffing/talents
export async function listTalents(): Promise<Talent[]> {
  return mockResponse(TALENTS_MOCK);
}

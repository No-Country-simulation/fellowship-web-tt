import { mockResponse } from "@core/api/mockClient";
import { COMPLETION_MOCK } from "../mocks/completion.mock";
import type { CompletionRow } from "../../types/completion";

// Real: GET /admin/completion
export async function listCompletion(): Promise<CompletionRow[]> {
  return mockResponse(COMPLETION_MOCK);
}

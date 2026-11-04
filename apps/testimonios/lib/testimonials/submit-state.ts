import type { FormIssue } from "./issues";

export type SubmitState =
  | { status: "idle" }
  | {
      status: "error";
      issue: FormIssue;
      fieldErrors?: Record<string, FormIssue | undefined>;
      step?: number;
    }
  | { status: "success" };

export const initialSubmitState: SubmitState = { status: "idle" };

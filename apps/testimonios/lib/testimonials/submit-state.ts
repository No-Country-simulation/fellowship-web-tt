export type SubmitState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      step?: number;
    }
  | { status: "success" };

export const initialSubmitState: SubmitState = { status: "idle" };

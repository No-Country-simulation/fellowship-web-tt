export type ReviewState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

export const initialReviewState: ReviewState = { status: "idle" };

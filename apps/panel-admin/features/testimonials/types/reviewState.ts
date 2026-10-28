export type ReviewState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

export const initialReviewState: ReviewState = { status: "idle" };

/** Estado de `archiveAction` para `useActionState`. El éxito redirige y no vuelve acá. */
export type ArchiveState = { status: "idle" } | { status: "error"; message: string };

export const initialArchiveState: ArchiveState = { status: "idle" };

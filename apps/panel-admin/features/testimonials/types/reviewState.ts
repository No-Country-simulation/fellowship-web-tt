export type ReviewState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

export const initialReviewState: ReviewState = { status: "idle" };

/** Estado de `archiveAction` para `useActionState`. El éxito redirige y no vuelve acá. */
export type ArchiveState = { status: "idle" } | { status: "error"; message: string };

export const initialArchiveState: ArchiveState = { status: "idle" };

/** Estado de `returnRejectedToReviewAction` para `useActionState`. El éxito redirige y no vuelve acá. */
export type ReturnToReviewState = { status: "idle" } | { status: "error"; message: string };

export const initialReturnToReviewState: ReturnToReviewState = { status: "idle" };

/** Estado de `deleteRejectedAction`. El éxito no redirige: la lista muestra el resultado. */
export type BulkDeleteState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; deletedIds: string[]; failed: number; skipped: number };

export const initialBulkDeleteState: BulkDeleteState = { status: "idle" };

"use client";

import { useId, useRef, useTransition } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { deleteRejectedAction } from "../actions/testimonialActions";
import type { BulkDeleteState } from "../types/reviewState";
import { ModalDialog } from "./ModalDialog";

const PREVIEW_NAMES = 5;

/** Confirmación del borrado definitivo. El foco inicial queda en Cancelar. */
export function BulkDeleteDialog({
  ids,
  names,
  onClose,
  onDeletingChange,
  onResult,
}: {
  ids: string[];
  names: string[];
  onClose: () => void;
  onDeletingChange: (deleting: boolean) => void;
  onResult: (state: BulkDeleteState) => void;
}) {
  const [pending, startTransition] = useTransition();
  const lock = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const preview = names.slice(0, PREVIEW_NAMES);
  const extra = names.length - preview.length;
  const count = ids.length;

  function close() {
    if (pending || lock.current) return;
    onClose();
  }

  function submit(formData: FormData) {
    if (lock.current) return;
    lock.current = true;
    onDeletingChange(true);
    startTransition(async () => {
      let result: BulkDeleteState;
      try {
        result = await deleteRejectedAction(formData);
      } catch {
        result = {
          status: "error",
          message: "No pudimos eliminar los testimonios. Probá de nuevo.",
        };
      }
      onResult(result);
      lock.current = false;
      onDeletingChange(false);
      onClose();
    });
  }

  return (
    <ModalDialog open onClose={close} titleId={titleId} descriptionId={descriptionId}>
      <form action={submit} className="flex flex-col gap-4" aria-busy={pending || undefined}>
        {ids.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
            {deleteTitle(count)}
          </h2>
          <div id={descriptionId} className="flex flex-col gap-2">
            <p className="text-admin-caption text-muted-foreground">
              Se borran de forma definitiva, con el avatar, la foto y la card. No se puede deshacer.
            </p>
            {preview.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {preview.map((name, index) => (
                  <li
                    key={`${index}-${name}`}
                    className="truncate text-admin-caption text-foreground"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
            {extra > 0 ? (
              <p className="text-admin-caption text-muted-foreground">y {extra} más</p>
            ) : null}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {pending ? "Eliminando…" : ""}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            onClick={close}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending || count === 0}
            className={cn(buttonVariants({ variant: "destructive", size: "lg" }))}
          >
            {pending ? "Eliminando…" : "Eliminar definitivamente"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}

function deleteTitle(count: number) {
  if (count === 1) return "¿Eliminar 1 testimonio rechazado?";
  return `¿Eliminar ${count} testimonios rechazados?`;
}

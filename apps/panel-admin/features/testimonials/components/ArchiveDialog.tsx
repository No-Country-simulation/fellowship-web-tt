"use client";

import { useActionState, useId, useState } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { archiveAction } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { initialArchiveState } from "../types/reviewState";
import { ARCHIVE_REASON_MAX_CHARS } from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";
import { textareaClassName } from "./fields";
import { ModalDialog } from "./ModalDialog";

/** Botón Archivar del header de Publicado, con el diálogo del motivo. */
export function ArchiveDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={buttonVariants({ variant: "outline", size: "sm" })}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Archivar
      </button>
      {open ? <ArchiveForm id={id} onCancel={() => setOpen(false)} /> : null}
    </>
  );
}

function ArchiveForm({ id, onCancel }: { id: string; onCancel: () => void }) {
  const archive = archiveAction.bind(null, id);
  const [state, formAction, pending] = useActionState(archive, initialArchiveState);
  const [reason, setReason] = useState("");
  const { filtersField } = useInboxFilters();
  const titleId = useId();
  const descriptionId = useId();
  const reasonId = useId();
  const countId = useId();
  const errorId = useId();
  const reasonReady =
    reason.trim().length > 0 && reason.length <= ARCHIVE_REASON_MAX_CHARS;
  const invalid = state.status === "error";

  function close() {
    if (!pending) onCancel();
  }

  return (
    <ModalDialog open onClose={close} titleId={titleId} descriptionId={descriptionId}>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name={INBOX_FILTERS_FIELD} value={filtersField} readOnly />
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
            ¿Archivar este testimonio?
          </h2>
          <p id={descriptionId} className="text-admin-caption text-muted-foreground">
            Sale de la galería. Los posts ya enviados a Discord, Instagram y LinkedIn no se borran.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={reasonId} className="min-w-0 text-admin-caption text-foreground">
              Motivo (obligatorio)
            </label>
            <p id={countId} className="shrink-0 text-admin-micro text-muted-foreground">
              {reason.length}/{ARCHIVE_REASON_MAX_CHARS}
            </p>
          </div>
          <textarea
            id={reasonId}
            name="reason"
            value={reason}
            maxLength={ARCHIVE_REASON_MAX_CHARS}
            rows={4}
            required
            aria-required="true"
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${countId} ${errorId}` : countId}
            className={textareaClassName}
            onChange={(event) => setReason(event.target.value)}
          />
          {state.status === "error" ? (
            <p id={errorId} className="text-admin-caption text-destructive" role="alert">
              {state.message}
            </p>
          ) : null}
        </div>
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
            disabled={pending || !reasonReady}
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            {pending ? "Archivando…" : "Archivar"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}

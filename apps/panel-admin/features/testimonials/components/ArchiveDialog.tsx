"use client";

import { useActionState, useId, useState } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { archiveAction } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { initialArchiveState } from "../types/reviewState";
import { ARCHIVE_REASON_MAX_CHARS } from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";
import { ModalDialog } from "./ModalDialog";
import { ReasonField } from "./ReasonField";

/** Botón Archivar del header de Publicado, con el diálogo del motivo. */
export function ArchiveDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 md:h-7")}
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
  const reasonReady =
    reason.trim().length > 0 && reason.length <= ARCHIVE_REASON_MAX_CHARS;

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
        <ReasonField
          value={reason}
          maxChars={ARCHIVE_REASON_MAX_CHARS}
          error={state.status === "error" ? state.message : null}
          onChange={setReason}
        />
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

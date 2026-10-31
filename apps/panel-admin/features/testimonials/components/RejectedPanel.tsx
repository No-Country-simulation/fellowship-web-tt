"use client";

import { useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { returnRejectedToReviewAction } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { initialReturnToReviewState } from "../types/reviewState";
import type { AdminTestimonial } from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";
import { ModalDialog } from "./ModalDialog";

/** Rechazado: devolver a revisión si el rechazo fue un error. */
export function RejectedPanel({ testimonial }: { testimonial: AdminTestimonial }) {
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby="admin-rejected-title"
      className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4"
    >
      <header className="flex flex-col gap-1">
        <h2 id="admin-rejected-title" className="text-admin-heading font-semibold text-foreground">
          Rechazado
        </h2>
        <p className="text-admin-caption text-muted-foreground">
          No sale en la galería ni en las redes. El envío queda guardado. Si el rechazo fue un error,
          podés devolverlo a revisión para guardarlo, publicarlo o rechazarlo de nuevo.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          Volver a revisión
        </button>
      </div>
      {open ? (
        <ReturnToReviewForm testimonial={testimonial} onCancel={() => setOpen(false)} />
      ) : null}
    </section>
  );
}

function ReturnToReviewForm({
  testimonial,
  onCancel,
}: {
  testimonial: AdminTestimonial;
  onCancel: () => void;
}) {
  const action = returnRejectedToReviewAction.bind(null, testimonial.id);
  const [state, formAction, pending] = useActionState(action, initialReturnToReviewState);
  const { filtersField } = useInboxFilters();
  const titleId = useId();
  const descriptionId = useId();
  // pending llega un render después: el ref corta el segundo envío en ese hueco.
  const lock = useRef(false);

  useEffect(() => {
    if (!pending) {
      lock.current = false;
    }
  }, [pending]);

  function close() {
    if (pending || lock.current) return;
    onCancel();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (pending || lock.current) {
      event.preventDefault();
      return;
    }
    lock.current = true;
  }

  return (
    <ModalDialog open onClose={close} titleId={titleId} descriptionId={descriptionId}>
      <form action={formAction} className="flex flex-col gap-4" onSubmit={onSubmit}>
        <input type="hidden" name={INBOX_FILTERS_FIELD} value={filtersField} readOnly />
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
            ¿Volver a poner este testimonio en revisión?
          </h2>
          <p id={descriptionId} className="text-admin-caption text-muted-foreground">
            Vas a poder editarlo, publicarlo o rechazarlo otra vez. No se envía nada a Discord,
            Instagram ni LinkedIn. El borrado definitivo sigue en la lista de Rechazados.
          </p>
        </div>
        {state.status === "error" ? (
          <p className="text-admin-caption text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}
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
            disabled={pending}
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            {pending ? "Volviendo a revisión…" : "Volver a revisión"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}

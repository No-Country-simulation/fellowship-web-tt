"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { rejectArchivedAction, republishAction } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import type { AdminTestimonial } from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";
import { ModalDialog } from "./ModalDialog";

type ArchivedActionKind = "republish" | "reject";

const ARCHIVED_ACTIONS = {
  republish: {
    label: "Volver a publicar",
    pendingLabel: "Volviendo a publicar…",
    title: "¿Volver a publicar este testimonio?",
    description: "Vuelve a la galería. No se reenvían los posts.",
    variant: "default",
  },
  reject: {
    label: "Rechazar",
    pendingLabel: "Rechazando…",
    title: "¿Rechazar este testimonio?",
    description: "No sale en la galería ni en las redes.",
    variant: "destructive",
  },
} as const;

/** Archivado: el motivo queda a la vista. Se puede volver a publicar o rechazar. */
export function ArchivedPanel({ testimonial }: { testimonial: AdminTestimonial }) {
  const { filtersField } = useInboxFilters();
  const [open, setOpen] = useState<ArchivedActionKind | null>(null);
  const [busy, setBusy] = useState<ArchivedActionKind | null>(null);

  return (
    <section
      aria-labelledby="admin-archived-title"
      className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4"
    >
      <header className="flex flex-col gap-1">
        <h2 id="admin-archived-title" className="text-admin-heading font-semibold text-foreground">
          Archivado
        </h2>
        <p className="text-admin-caption text-muted-foreground">
          No está en la galería. Los posts ya enviados siguen en las redes.
        </p>
      </header>
      {testimonial.archiveReason ? (
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-admin-caption font-medium text-foreground">Motivo</h3>
          <p className="whitespace-pre-wrap break-words text-admin-body text-foreground">
            {testimonial.archiveReason}
          </p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <ArchivedActionButton
          kind="republish"
          open={open === "republish"}
          disabled={busy !== null && busy !== "republish"}
          onOpen={() => setOpen("republish")}
        />
        <ArchivedActionButton
          kind="reject"
          open={open === "reject"}
          disabled={busy !== null && busy !== "reject"}
          onOpen={() => setOpen("reject")}
        />
      </div>
      {open ? (
        <ArchivedActionDialog
          id={testimonial.id}
          kind={open}
          filtersField={filtersField}
          onCancel={() => setOpen(null)}
          onBusy={() => setBusy(open)}
          onSettled={() => setBusy(null)}
        />
      ) : null}
    </section>
  );
}

function ArchivedActionButton({
  kind,
  open,
  disabled,
  onOpen,
}: {
  kind: ArchivedActionKind;
  open: boolean;
  disabled: boolean;
  onOpen: () => void;
}) {
  const copy = ARCHIVED_ACTIONS[kind];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(buttonVariants({ variant: copy.variant, size: "lg" }))}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onOpen}
    >
      {copy.label}
    </button>
  );
}

function ArchivedActionDialog({
  id,
  kind,
  filtersField,
  onCancel,
  onBusy,
  onSettled,
}: {
  id: string;
  kind: ArchivedActionKind;
  filtersField: string;
  onCancel: () => void;
  onBusy: () => void;
  onSettled: () => void;
}) {
  const action =
    kind === "republish" ? republishAction.bind(null, id) : rejectArchivedAction.bind(null, id);
  const copy = ARCHIVED_ACTIONS[kind];
  const titleId = useId();
  const descriptionId = useId();
  const lock = useRef(false);
  const [locked, setLocked] = useState(false);

  function close() {
    if (lock.current) return;
    onCancel();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (lock.current) {
      event.preventDefault();
      return;
    }
    lock.current = true;
    setLocked(true);
    onBusy();
  }

  function onIdle() {
    lock.current = false;
    setLocked(false);
    onSettled();
  }

  return (
    <ModalDialog open onClose={close} titleId={titleId} descriptionId={descriptionId}>
      <form action={action} className="flex flex-col gap-4" onSubmit={onSubmit}>
        <input type="hidden" name={INBOX_FILTERS_FIELD} value={filtersField} readOnly />
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
            {copy.title}
          </h2>
          <p id={descriptionId} className="text-admin-caption text-muted-foreground">
            {copy.description}
          </p>
        </div>
        <ArchivedActionControls
          locked={locked}
          label={copy.label}
          pendingLabel={copy.pendingLabel}
          variant={copy.variant}
          onCancel={close}
          onIdle={onIdle}
        />
      </form>
    </ModalDialog>
  );
}

function ArchivedActionControls({
  locked,
  label,
  pendingLabel,
  variant,
  onCancel,
  onIdle,
}: {
  locked: boolean;
  label: string;
  pendingLabel: string;
  variant: "default" | "destructive";
  onCancel: () => void;
  onIdle: () => void;
}) {
  const { pending } = useFormStatus();
  const onIdleRef = useRef(onIdle);
  const wasPending = useRef(false);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (wasPending.current && !pending) {
      onIdleRef.current();
    }
    wasPending.current = pending;
  }, [pending]);

  const disabled = pending || locked;

  return (
    <div className="flex flex-wrap justify-end gap-2" aria-busy={disabled || undefined}>
      <button
        type="button"
        disabled={disabled}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        onClick={onCancel}
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={disabled}
        className={cn(buttonVariants({ variant, size: "lg" }))}
      >
        {pending || locked ? pendingLabel : label}
      </button>
    </div>
  );
}

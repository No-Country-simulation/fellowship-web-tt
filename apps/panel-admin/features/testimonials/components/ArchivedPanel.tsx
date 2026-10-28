"use client";

import { useRef, useState, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { rejectArchivedAction, republishAction } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import type { AdminTestimonial } from "../types/testimonial";
import { useInboxFilters } from "./InboxFilters";

type ArchivedActionKind = "republish" | "reject";

const REJECT_CONFIRM = "¿Rechazar este testimonio? No sale en la galería ni en las redes.";
const REPUBLISH_CONFIRM =
  "¿Volver a publicar este testimonio? Vuelve a la galería. No se reenvían los posts.";

/** Archivado: el motivo queda a la vista. Se puede volver a publicar o rechazar. */
export function ArchivedPanel({ testimonial }: { testimonial: AdminTestimonial }) {
  const { filtersField } = useInboxFilters();
  const busyRef = useRef<ArchivedActionKind | null>(null);
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
        <StatusActionForm
          action={republishAction.bind(null, testimonial.id)}
          kind="republish"
          label="Volver a publicar"
          pendingLabel="Volviendo a publicar…"
          confirm={REPUBLISH_CONFIRM}
          variant="default"
          filtersField={filtersField}
          busy={busy}
          busyRef={busyRef}
          onBusy={setBusy}
        />
        <StatusActionForm
          action={rejectArchivedAction.bind(null, testimonial.id)}
          kind="reject"
          label="Rechazar"
          pendingLabel="Rechazando…"
          confirm={REJECT_CONFIRM}
          variant="destructive"
          filtersField={filtersField}
          busy={busy}
          busyRef={busyRef}
          onBusy={setBusy}
        />
      </div>
    </section>
  );
}

function StatusActionForm({
  action,
  kind,
  label,
  pendingLabel,
  confirm,
  variant,
  filtersField,
  busy,
  busyRef,
  onBusy,
}: {
  action: (formData: FormData) => Promise<void>;
  kind: ArchivedActionKind;
  label: string;
  pendingLabel: string;
  confirm: string;
  variant: "default" | "destructive";
  filtersField: string;
  busy: ArchivedActionKind | null;
  busyRef: RefObject<ArchivedActionKind | null>;
  onBusy: (kind: ArchivedActionKind) => void;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={INBOX_FILTERS_FIELD} value={filtersField} readOnly />
      <StatusActionButton
        label={label}
        pendingLabel={pendingLabel}
        confirm={confirm}
        variant={variant}
        blocked={busy !== null && busy !== kind}
        busyRef={busyRef}
        onAccept={() => {
          busyRef.current = kind;
          onBusy(kind);
        }}
      />
    </form>
  );
}

function StatusActionButton({
  label,
  pendingLabel,
  confirm,
  variant,
  blocked,
  busyRef,
  onAccept,
}: {
  label: string;
  pendingLabel: string;
  confirm: string;
  variant: "default" | "destructive";
  blocked: boolean;
  busyRef: RefObject<ArchivedActionKind | null>;
  onAccept: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || blocked}
      className={cn(buttonVariants({ variant, size: "lg" }))}
      onClick={(event) => {
        if (busyRef.current) {
          event.preventDefault();
          return;
        }
        if (!window.confirm(confirm)) {
          event.preventDefault();
          return;
        }
        onAccept();
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

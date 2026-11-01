"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { ModalDialog } from "./ModalDialog";

/** Lo que el modal muestra de cada red. */
export type PublishConfirmNetwork = {
  label: string;
  publishes: boolean;
  /** Descripción completa. Solo si se publica. */
  caption?: string;
};

/** Confirmación de publicar: foco adentro, Escape cancela, resumen por red. */
export function PublishConfirmDialog({
  open,
  lead,
  clipNote,
  networks,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  /** Una frase, o dos si hay alguna red configurada. */
  lead: readonly string[];
  clipNote: string | null;
  networks: readonly PublishConfirmNetwork[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <ModalDialog
      open={open}
      onClose={onCancel}
      titleId={titleId}
      descriptionId={descriptionId}
      className="max-w-xl"
    >
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
          ¿Publicar este testimonio?
        </h2>
        <div id={descriptionId} className="flex flex-col gap-2">
          {lead.map((sentence) => (
            <p key={sentence} className="text-admin-caption text-muted-foreground">
              {sentence}
            </p>
          ))}
          {clipNote ? <p className="text-admin-caption text-tone-warning">{clipNote}</p> : null}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {networks.map((network) =>
          network.publishes ? (
            <li key={network.label} className="min-w-0 overflow-hidden rounded-lg border border-border">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-admin-body text-foreground [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">{network.label}</span>
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="whitespace-pre-wrap break-words border-t border-border px-3 py-3 text-admin-caption text-foreground">
                  {network.caption}
                </p>
              </details>
            </li>
          ) : (
            <li key={network.label} className="min-w-0 text-admin-caption text-muted-foreground">
              <p>{network.label}</p>
              <p>No se publica.</p>
            </li>
          ),
        )}
      </ul>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          onClick={onConfirm}
        >
          Publicar
        </button>
      </div>
    </ModalDialog>
  );
}

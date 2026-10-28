"use client";

import { useId } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { ModalDialog } from "./ModalDialog";

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
  lead: string;
  clipNote: string | null;
  networks: { label: string; summary: string }[];
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
    >
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
          ¿Publicar este testimonio?
        </h2>
        <div id={descriptionId} className="flex flex-col gap-2">
          <p className="text-admin-caption text-muted-foreground">{lead}</p>
          {clipNote ? <p className="text-admin-caption text-tone-warning">{clipNote}</p> : null}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {networks.map((network) => (
          <li key={network.label} className="min-w-0">
            <p className="text-admin-caption font-medium text-foreground">{network.label}</p>
            <p className="text-admin-caption text-muted-foreground">{network.summary}</p>
          </li>
        ))}
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

"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

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
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const nodes = [...dialog.querySelectorAll<HTMLElement>("button:not([disabled])")];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[80vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-lg"
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
            ref={cancelRef}
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
      </div>
    </div>,
    document.body,
  );
}

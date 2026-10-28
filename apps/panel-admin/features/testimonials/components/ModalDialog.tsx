"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Botones y textareas habilitados. El mismo conjunto se usa para el foco inicial y la trampa de Tab. */
const MODAL_FOCUSABLE = "button:not([disabled]), textarea:not([disabled])";

/**
 * Diálogo del panel: portal, foco en el primer control habilitado, Escape y clic afuera
 * cancelan, Tab queda adentro y al cerrar vuelve el foco a donde estaba.
 */
export function ModalDialog({
  open,
  onClose,
  titleId,
  descriptionId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLElement>(MODAL_FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const nodes = [...dialog.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE)];
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
          onClose();
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
        {children}
      </div>
    </div>,
    document.body,
  );
}

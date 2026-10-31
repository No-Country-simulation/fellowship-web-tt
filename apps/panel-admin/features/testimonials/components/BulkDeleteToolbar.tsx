"use client";

import { useState } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import type { BulkDeleteState } from "../types/reviewState";
import { BULK_DELETE_MAX } from "../types/testimonial";
import { BulkDeleteDialog } from "./BulkDeleteDialog";

/** Barra de la pestaña Rechazados: seleccionar, confirmar y ver el resultado. */
export function BulkDeleteToolbar({
  visibleCount,
  selectedCount,
  allSelected,
  overMax,
  ids,
  names,
  deleting,
  state,
  onToggleAll,
  onDeletingChange,
  onResult,
}: {
  visibleCount: number;
  selectedCount: number;
  allSelected: boolean;
  overMax: boolean;
  ids: string[];
  names: string[];
  deleting: boolean;
  state: BulkDeleteState;
  onToggleAll: () => void;
  onDeletingChange: (deleting: boolean) => void;
  onResult: (state: BulkDeleteState) => void;
}) {
  const [draft, setDraft] = useState<{ ids: string[]; names: string[] } | null>(null);
  const mixed = selectedCount > 0 && !allSelected;

  return (
    <div className="flex flex-col gap-1 px-2 pb-1">
      {visibleCount > 0 ? (
        <>
          <div className="flex min-h-11 items-center justify-between gap-2">
            <label
              className={cn(
                "flex min-w-0 items-center text-admin-caption text-foreground",
                deleting ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center">
                <input
                  ref={(node) => {
                    if (node) node.indeterminate = mixed;
                  }}
                  type="checkbox"
                  checked={allSelected}
                  disabled={deleting}
                  aria-checked={mixed ? "mixed" : allSelected ? "true" : "false"}
                  aria-label={`Seleccionar todos (${visibleCount})`}
                  className="size-4 shrink-0 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                  onChange={onToggleAll}
                />
              </span>
              <span className="truncate">Todos ({visibleCount})</span>
            </label>
            {selectedCount > 0 ? (
              <div className="flex shrink-0 items-center gap-2">
                <p
                  aria-live="polite"
                  className="whitespace-nowrap text-admin-micro text-muted-foreground"
                >
                  {selectedCountLabel(selectedCount)}
                </p>
                <button
                  type="button"
                  disabled={deleting}
                  aria-haspopup="dialog"
                  aria-expanded={draft !== null}
                  className={buttonVariants({ variant: "destructive", size: "sm" })}
                  onClick={() => setDraft({ ids, names })}
                >
                  Eliminar
                </button>
              </div>
            ) : null}
          </div>
          {overMax ? (
            <p className="pl-11 text-admin-micro text-muted-foreground">
              Máximo {BULK_DELETE_MAX} por vez
            </p>
          ) : null}
        </>
      ) : null}
      {state.status === "error" ? (
        <p
          role="alert"
          className={cn(
            "text-admin-caption text-destructive",
            visibleCount > 0 ? "pl-11" : "px-1",
          )}
        >
          {state.message}
        </p>
      ) : null}
      {state.status === "done" ? (
        <p
          role="status"
          className={cn(
            "text-admin-caption text-foreground",
            visibleCount > 0 ? "pl-11" : "px-1",
          )}
        >
          {bulkDeleteSummary(state.deletedIds.length, state.failed, state.skipped)}
        </p>
      ) : null}
      {draft ? (
        <BulkDeleteDialog
          ids={draft.ids}
          names={draft.names}
          onClose={() => setDraft(null)}
          onDeletingChange={onDeletingChange}
          onResult={onResult}
        />
      ) : null}
    </div>
  );
}

function selectedCountLabel(count: number) {
  return count === 1 ? "1 seleccionado" : `${count} seleccionados`;
}

function bulkDeleteSummary(deleted: number, failed: number, skipped: number) {
  const parts: string[] = [];
  if (deleted === 1) parts.push("Se eliminó 1.");
  else if (deleted > 1) parts.push(`Se eliminaron ${deleted}.`);

  if (failed === 1) {
    parts.push("1 no se pudo borrar y quedó marcado para reintentar.");
  } else if (failed > 1) {
    parts.push(`${failed} no se pudieron borrar y quedaron marcados para reintentar.`);
  }

  if (skipped === 1) {
    parts.push("1 ya no estaba entre los rechazados.");
  } else if (skipped > 1) {
    parts.push(`${skipped} ya no estaban entre los rechazados.`);
  }

  if (parts.length === 0) return "No se eliminó ningún testimonio.";
  return parts.join(" ");
}

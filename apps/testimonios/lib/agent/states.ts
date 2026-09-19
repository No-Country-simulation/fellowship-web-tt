import type { ContenidoStatus } from "./types";

/** Allowed state transitions for contenido_generado rows. */
export const ALLOWED_TRANSITIONS: Readonly<
  Record<ContenidoStatus, readonly ContenidoStatus[]>
> = {
  pendiente: ["procesando_media", "generando_copy", "error"],
  procesando_media: ["generando_copy", "error"],
  generando_copy: ["listo_revision", "error"],
  listo_revision: ["aprobado", "rechazado", "error"],
  aprobado: ["publicado", "error"],
  rechazado: [],
  publicado: [],
  error: [],
};

export function canTransition(
  from: ContenidoStatus,
  to: ContenidoStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Initial active status after processing starts.
 * Text-only MUST skip `procesando_media`.
 */
export function initialStatusAfterStart(hasMedia: boolean): ContenidoStatus {
  return hasMedia ? "procesando_media" : "generando_copy";
}

export function assertTransition(
  from: ContenidoStatus,
  to: ContenidoStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transición no permitida: ${from} → ${to}`);
  }
}

import { assertTransition } from "./states";
import type {
  ContenidoGeneradoRow,
  ContenidoRepository,
  PublishResult,
} from "./types";

/**
 * Domain helper for POST /api/agent/publicar.
 * Publishes only `aprobado` rows → `publicado` (transport TBD: DB mark only).
 * Fail-closed when zero aprobado rows exist for the testimonio.
 */
export async function publishApproved(
  testimonioId: string,
  deps: { repo: ContenidoRepository },
): Promise<PublishResult> {
  if (!testimonioId || testimonioId.trim() === "") {
    return {
      ok: false,
      error: "testimonioId es obligatorio.",
    };
  }

  const rows = await deps.repo.listByTestimonio(testimonioId);
  const aprobadoRows = rows.filter((row) => row.status === "aprobado");

  if (aprobadoRows.length === 0) {
    return {
      ok: false,
      error: "No hay filas en estado aprobado para publicar.",
    };
  }

  const published: ContenidoGeneradoRow[] = [];

  for (const row of aprobadoRows) {
    assertTransition(row.status, "publicado");
    const updated = await deps.repo.updateStatus(
      testimonioId,
      row.plataforma,
      "publicado",
    );
    if (updated) {
      published.push(updated);
    }
  }

  return { ok: true, published };
}

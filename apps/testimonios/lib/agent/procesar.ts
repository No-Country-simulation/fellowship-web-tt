import { enqueueMediaJob as defaultEnqueueMediaJob } from "./enqueue";
import { initialStatusAfterStart } from "./states";
import type {
  ContenidoRepository,
  MediaEnqueue,
  Plataforma,
  StartProcessingInput,
  StartProcessingResult,
} from "./types";

const ALLOWED_PLATAFORMAS = new Set<Plataforma>(["instagram", "linkedin"]);

function isPlataforma(value: string): value is Plataforma {
  return ALLOWED_PLATAFORMAS.has(value as Plataforma);
}

/**
 * Domain helper that `POST /api/agent/procesar` will call.
 * Validates platforms, creates per-platform row plans, and enqueues media when needed.
 */
export async function startProcessing(
  input: StartProcessingInput,
  deps: {
    repo: ContenidoRepository;
    enqueue?: MediaEnqueue;
  },
): Promise<StartProcessingResult> {
  const plataformas = input.plataformas ?? [];

  if (plataformas.length === 0) {
    return {
      ok: false,
      error: "Debes seleccionar al menos una plataforma.",
    };
  }

  for (const plataforma of plataformas) {
    if (!isPlataforma(plataforma)) {
      return {
        ok: false,
        error: `Plataforma no válida: ${plataforma}.`,
      };
    }
  }

  const unique = [...new Set(plataformas)];
  const status = initialStatusAfterStart(input.hasMedia);
  const plans = unique.map((plataforma) => ({
    testimonioId: input.testimonioId,
    plataforma,
    status,
  }));

  const rows = await deps.repo.createRows(plans);

  if (input.hasMedia) {
    const enqueue = deps.enqueue ?? { enqueueMediaJob: defaultEnqueueMediaJob };
    for (const row of rows) {
      await enqueue.enqueueMediaJob(row.testimonioId, row.plataforma);
    }
  }

  return { ok: true, rows };
}

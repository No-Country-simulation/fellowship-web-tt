import { assertTransition } from "./states";
import { verifyHmacSha256Hex } from "./hmac";
import type {
  ContenidoRepository,
  MediaJobStore,
  MediaListoPayload,
  MediaListoResult,
  Plataforma,
} from "./types";

const ALLOWED_PLATAFORMAS = new Set<Plataforma>(["instagram", "linkedin"]);

export type OnCopyTrigger = (payload: MediaListoPayload) => Promise<void> | void;

export type HandleMediaListoInput = {
  rawBody: string;
  signatureHeader: string | null | undefined;
  secret: string;
  repo: ContenidoRepository;
  jobs: MediaJobStore;
  /** Injectable stub for Gemini / copy fan-out; counted for idempotency tests. */
  onCopyTrigger?: OnCopyTrigger;
};

function parsePayload(rawBody: string): MediaListoPayload | null {
  try {
    const parsed = JSON.parse(rawBody) as Partial<MediaListoPayload>;
    if (
      typeof parsed.jobId !== "string" ||
      typeof parsed.testimonioId !== "string" ||
      typeof parsed.plataforma !== "string" ||
      typeof parsed.mediaAssetPath !== "string"
    ) {
      return null;
    }
    if (!ALLOWED_PLATAFORMAS.has(parsed.plataforma as Plataforma)) {
      return null;
    }
    return {
      jobId: parsed.jobId,
      testimonioId: parsed.testimonioId,
      plataforma: parsed.plataforma as Plataforma,
      mediaAssetPath: parsed.mediaAssetPath,
    };
  } catch {
    return null;
  }
}

/**
 * Domain handler for POST /api/webhooks/media-listo.
 * Verifies HMAC, applies idempotent fan-in (procesando_media → generando_copy).
 */
export async function handleMediaListo(
  input: HandleMediaListoInput,
): Promise<MediaListoResult> {
  if (
    !verifyHmacSha256Hex(input.rawBody, input.secret, input.signatureHeader)
  ) {
    return {
      status: 401,
      body: { ok: false, error: "Firma HMAC inválida o ausente." },
    };
  }

  const payload = parsePayload(input.rawBody);
  if (!payload) {
    return {
      status: 400,
      body: { ok: false, error: "Cuerpo del webhook inválido." },
    };
  }

  if (await input.jobs.isProcessed(payload.jobId)) {
    return {
      status: 200,
      body: { ok: true, duplicate: true },
    };
  }

  const rows = await input.repo.listByTestimonio(payload.testimonioId);
  const row = rows.find((r) => r.plataforma === payload.plataforma);
  if (!row) {
    return {
      status: 404,
      body: { ok: false, error: "Contenido no encontrado para la plataforma." },
    };
  }

  try {
    assertTransition(row.status, "generando_copy");
  } catch {
    return {
      status: 409,
      body: {
        ok: false,
        error: `Estado no permite media-listo: ${row.status}.`,
      },
    };
  }

  await input.repo.updateStatus(
    payload.testimonioId,
    payload.plataforma,
    "generando_copy",
  );
  await input.repo.saveMediaAssetPath(
    payload.testimonioId,
    payload.plataforma,
    payload.mediaAssetPath,
  );
  await input.jobs.markProcessed(payload.jobId);

  if (input.onCopyTrigger) {
    await input.onCopyTrigger(payload);
  }

  return {
    status: 200,
    body: { ok: true },
  };
}
